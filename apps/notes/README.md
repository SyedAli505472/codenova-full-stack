# Notes Application

React + Express + SQLite notebook with create/view/edit/delete, instant title/content search, timestamps, responsive cards and confirmed server mutations. Source: `apps/notes/Page.jsx`, `routes.js`, `schema.sql`. Shared components: `client/`; storage and server: `server/`.

## Setup and run

Requires Node 24 LTS and npm. From the suite root: `npm ci`, configure `.env` from `.env.example`, `npm run db:init`, `npm run build`, `npm start`. Open `http://127.0.0.1:3100/#notes`. To run only this assignment set `APP_MODULE=notes` before starting, or use `npm run export` and copy `exports/codenova-notes` to a new directory. Run the same commands inside that standalone folder. Admin credentials are unnecessary for Notes. PORT and DB_PATH configure the local server/database.

## API and model

| Endpoint              | Behavior                                                   |
| --------------------- | ---------------------------------------------------------- |
| GET /api/notes        | All notes ordered by updated_at, then ID descending        |
| GET /api/notes/:id    | One note; 404 if missing                                   |
| POST /api/notes       | Create `{ "title": "Idea", "content": "Learn React" }`     |
| PUT /api/notes/:id    | Update with the same fields                                |
| DELETE /api/notes/:id | Delete; returns `{ "data": { "id": 1, "deleted": true } }` |

POST returns 201 and `{ "data": { "id": 1, "title": "Idea", "content": "Learn React", "created_at": "UTC timestamp", "updated_at": "UTC timestamp" } }`. Error envelope: `{ "error": { "message": "..." } }`. Validation: 400; missing ID: 404. Titles trim to 1–120 characters; content trims to 1–5000. SQLite notes table holds ID, title, content, created_at and updated_at. UI replaces rows only after successful responses, so failed requests preserve displayed records.

## Testing and demo

From the package root, `npm run build` then `npm test`. Focused check: `node --test tests/notes.test.js tests/restart.test.js`. See `docs/WALKTHROUGH.md` for create, search, edit, delete/cancel, failure and restart demonstration. Evidence and execution details are in `docs/VERIFICATION.md`.

Suggested public repository: **codenova-notes**. Use the main README's upload commands from the exported directory. No credentials or databases belong in Git.
