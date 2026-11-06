# Student Project Showcase

Public project submission, an approved-only gallery, instant search/tag filtering, and protected moderation. React + Express + SQLite. Source: `apps/showcase/Page.jsx`, `routes.js`, `schema.sql`.

## Setup and admin

Node 24 LTS required. From the package root: `npm ci`, copy `.env.example` to `.env`, set ADMIN_USERNAME and ADMIN_PASSWORD (12+ characters), `npm run db:init`, `npm run build`, `npm start`. Open `http://127.0.0.1:3100/#showcase`. Admin review uses the configured credentials, HttpOnly session cookies and backend authorization. PORT defaults to 3100; DB_PATH defaults to `./data/full-stack.sqlite`. No projects are seeded automatically. For standalone use set APP_MODULE=showcase, or run `npm run export` and use **codenova-project-showcase**.

## API and model

| Endpoint                           | Behavior                                         |
| ---------------------------------- | ------------------------------------------------ |
| POST /api/projects                 | Create Pending project; 201                      |
| GET /api/projects?q=term&tag=react | Approved projects only                           |
| GET /api/projects/:id              | Approved project only; otherwise 404             |
| GET /api/admin/projects            | Protected review list with all statuses          |
| PATCH /api/admin/projects/:id      | Protected `{ "status": "Approved" }` or Rejected |

Submission example: `{ "title": "Study Buddy", "student_name": "Demo Student", "description": "A collaborative study planner", "tags": ["react", "education"], "github_url": "https://github.com/demo/study-buddy", "preview_url": "https://example.com" }`. Returns `{ "data": { "id": 1, "status": "Pending" } }`. User-supplied status cannot override Pending. Invalid fields or URLs return 400. Unauthorized admin requests return 401. Errors use `{ "error": { "message": "..." } }`.

Titles/names 1–120 characters, description 1–2000, 1–5 tags each 1–24. Both URLs must be HTTPS without credentials; GitHub link must point to a repository under github.com. Table: id, title, student_name, description, tags (JSON), github_url, preview_url, status, created_at, reviewed_at. Public list and detail queries filter Approved in SQL, so Pending/Rejected records cannot be retrieved publicly. Admin can revise a decision; rejecting an approved project removes it from public API results immediately.

## Testing and demo

`npm run build` then `npm test`; focused `node --test tests/showcase.test.js`. Covers invalid links, Pending creation, unauthorized approval, approval to gallery, tag/search filters and rejection removing public visibility. See `docs/WALKTHROUGH.md` for public and admin demo steps and `docs/VERIFICATION.md` for evidence. Suggested public repository: **codenova-project-showcase**; upload instructions in the main README.
