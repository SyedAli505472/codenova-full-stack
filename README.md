# Full Stack — CodeNova Internship, Batch 01

One working website with a home dashboard and four applications: Notes, Expense Tracker, Event Registration and Student Project Showcase. Built for a local Windows demonstration using React + Vite, Express and persistent SQLite. All dependencies are free.

## Quick start on Windows

Install **Node.js 24 LTS** (includes npm). Open this folder in VS Code and select Terminal → New Terminal. Run:

```powershell
npm ci
Copy-Item .env.example .env
notepad .env
```

Set `ADMIN_USERNAME` and replace `ADMIN_PASSWORD` with your own password of at least 12 characters. Save the file. Then:

```powershell
npm run db:init
npm run seed
npm run build
npm start
```

Open **http://127.0.0.1:3100**. After setup, the single command **`npm start`** runs the complete website and backend. Stop with Ctrl+C. The installed local copy already has a private `.env`; do not overwrite it unless intentionally changing credentials. The downloadable source contains only `.env.example`.

Development mode: `npm run dev` starts Express and Vite together. Open http://127.0.0.1:5175. Run `npm run build` again before using production mode. If port 3100 is occupied, change PORT in `.env`, restart, and use the new URL. Do not run production and development backends on the same port simultaneously.

VS Code includes build/test/start tasks and a **Run Full Stack website** debugger configuration. After installation and `.env` setup, press **F5** to build and run it in VS Code's terminal. Stop any existing server on the same port first, or use the website that is already running.

If startup reports **port 3100 is already in use**, first open http://127.0.0.1:3100: your project may already be running. To start a separate instance, change `PORT` in `.env` to an unused port such as `3101`, then run `npm start` and open http://127.0.0.1:3101. Startup failures do not print a ready message.

## Features

- **Notes:** create, read, edit, delete, instant title/content search, timestamps, confirmed mutations.
- **Expenses:** income and expense entries, supported categories, valid calendar dates, integer paisa, server totals, negative balances and deletion.
- **Events:** fictional seeded events, live availability, normalized email uniqueness, atomic capacity enforcement, private attendee search and check-in badges.
- **Showcase:** public submissions, validated links, Pending/Approved/Rejected moderation, approved-only public gallery, instant search and tag filtering.
- Shared navigation, consistent responsive theme, labeled forms, focus rings, loading, empty, success and error feedback.

## Architecture and folders

```text
React browser → /api/* → Express routes → SQLite file
                         └ admin session middleware

apps/notes/       Notes UI, routes, schema, README
apps/expenses/    Expense UI, validation, routes, schema, README
apps/events/      Event UI, routes, seed, schema, README
apps/showcase/    Showcase UI, routes, schema, README
client/          Home dashboard, shared controls, admin login, responsive CSS
server/          HTTP server, SQLite setup, authentication, errors
scripts/         Development runner, schema/seed, standalone exporter
tests/           Direct HTTP integration, persistence and security checks
docs/            Walkthrough, verification report, real screenshots when available
data/            SQLite runtime file (ignored)
exports/         Self-contained repository packages (generated, ignored)
app-config.json  Default enabled assignment; all for the suite
```

Existing Notes behavior was carried forward into Express so the final submission needs one runtime. The previous projects remain separate in the parent workspace. Expense amount validation was reused from the earlier tested implementation. Existing personal databases are not copied into submissions.

## Configuration and local admin

| Variable | Default / rule |
| --- | --- |
| PORT | 3100; loopback binding only |
| DB_PATH | `./data/full-stack.sqlite`, relative to the project working directory |
| APP_MODULE | `all`, `notes`, `expenses`, `events` or `showcase`; otherwise app-config.json |
| ADMIN_USERNAME | No built-in credential; set in `.env` |
| ADMIN_PASSWORD | At least 12 characters; placeholder rejected; set in `.env` |
| COOKIE_SECURE | Optional `true` for HTTPS deployments; omit for local HTTP |

Admin login is checked on the backend. Password comparison uses scrypt and constant-time comparison. Random session tokens use HttpOnly, SameSite=Strict cookies and expire after two hours. Restarting the server ends admin sessions. Five failed sign-ins from one address block further attempts for 15 minutes. Cross-origin admin mutations are rejected. Public APIs never return attendee contact details or unapproved projects. This is a local internship demo, with one administrator and no public user accounts; internet deployment would need HTTPS and a production operations review.

## Database and validation

Node's built-in `node:sqlite` stores a real file outside build directories. Startup and `db:init` create missing tables without deleting records. `seed` inserts three fictional events using unique slugs; running it repeatedly does not duplicate them. Other apps start empty. Each assignment's `schema.sql` is the authoritative model.

Notes: title 1–120, content 1–5000 characters, trimmed. Expenses: description 1–120; positive amount PKR 0.01–1,000,000 with at most two decimals; supported category matching type; valid YYYY-MM-DD dates, years 0001–9999. Amounts store integer paisa (12.34 → 1234). Events: name/organization 1–120, valid email ≤254 characters, at least one supported interest. Showcase: title/name 1–120, description 1–2000, 1–5 tags each ≤24, HTTPS GitHub repository and preview URLs. URLs are stored as links; the server does not fetch them.

Queries use parameters. Event registration uses `BEGIN IMMEDIATE` plus capacity check and insertion in the same transaction, and `UNIQUE(event_id,email)` in SQLite. Back up the database with the server stopped. Avoid running the same SQLite database concurrently on multiple computers through OneDrive.

## API conventions

All JSON success responses use `{ "data": ... }`; errors use `{ "error": { "message": "..." } }`. POST creation returns 201; successful reads/updates/deletes return 200. Validation/malformed JSON: 400; missing/admin login: 401; foreign-origin admin request: 403; missing record: 404; duplicate/full event: 409; large body: 413; login throttling: 429; unconfigured admin: 503; generic database failure: 500. Body limit: 32 KB. IDs are positive safe integers.

GET `/api/health` checks database access. GET `/api/config` returns enabled modules. Admin session endpoints: POST `/api/admin/login` with `{ "username": "...", "password": "..." }`, GET `/api/admin/session`, POST `/api/admin/logout`. Cookies must be retained for admin calls. See each `apps/*/README.md` for assignment endpoint tables and examples.

Example from PowerShell (running server):

```powershell
$body = @{title='First idea';content='Build something useful'} | ConvertTo-Json
Invoke-RestMethod http://127.0.0.1:3100/api/notes -Method Post -ContentType application/json -Body $body
Invoke-RestMethod http://127.0.0.1:3100/api/notes
```

For admin API experiments, use `Invoke-RestMethod ... -SessionVariable session` on login, then `-WebSession $session` on protected requests. Do not put real passwords into committed scripts.

## Tests and demo evidence

```powershell
npm run build
npm test
```

Build first: tests include serving the actual compiled HTML and JavaScript. Tests use temporary/in-memory databases and random localhost ports, and do not mutate your records. They cover all main workflows, validation, authorization, concurrent registration, decimal totals, and persistence. See [verification report](docs/VERIFICATION.md) for actual results and [walkthrough](docs/WALKTHROUGH.md) for the exact demo and screenshot sequence.

## Four standalone repositories

```powershell
npm run export
npm run verify:exports
```

This creates `exports/codenova-notes`, `exports/codenova-expense-tracker`, `exports/codenova-event-registration` and `exports/codenova-project-showcase`. Each has its own README, lockfile, schema, environment example and shared runtime files. It does not depend on a parent node_modules directory. Only the selected assignment's routes, schema and navigation are enabled by default. Shared source is included intentionally so each package can build independently. Copy an exported folder outside this suite, run `npm ci`, configure `.env`, then `npm run db:init`, `npm run seed`, `npm run build`, `npm start`. Change PORT when running multiple exports at once. See each exported README for details.

`verify:exports` copies each export to an isolated temporary folder, installs from the local npm cache, builds it and checks its HTTP server and module isolation. Run `npm ci` normally first to populate the cache; this verification command uses offline installs. All four exports passed this check on November 6, 2026.

To create the downloadable source archives after exporting, run `powershell -ExecutionPolicy Bypass -File scripts/package.ps1`. This packages only an explicit list of source/documentation paths and creates `release/Full_Stack_Project.zip` plus `release/Four_GitHub_Repositories.zip`. It excludes real `.env` files, databases, dependencies and builds. See [submission guide](docs/SUBMISSION.md) for the final upload checklist and exact repository commands.

Create four empty **public** GitHub repositories with those names. From each copied folder outside any existing Git repository:

```powershell
git init
git add .
git status
git commit -m "Complete CodeNova internship application"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
git push -u origin main
```

Replace both placeholders. Review staged files before committing. Real credentials, runtime data, dependencies and generated builds must remain ignored. Uploads require your GitHub account; no repository links or hosting links are claimed unless actually created. The local website and walkthrough are ready for demonstration.

## Scope

Local single-user notes/expenses, a local admin for events/showcase, no bank integration, email delivery, file uploads, or authentication for public users. Lists are loaded in full, appropriate for the assignment scale. Optional Google Fonts fall back to system fonts offline. The Node SQLite API may emit an experimental warning. Schema changes in future releases would require migrations. Showcase links belong to submitters; approval is a human review action.
