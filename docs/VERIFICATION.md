# Final verification — November 6, 2026

Environment: Windows, Node 24.21.0, npm 11.19.0. The existing four-app suite in `Full_Stack_Final` was inspected and reused. Earlier projects and databases were preserved. No official assignment PDF was attached to this request; the supplied written requirements were used.

## Executed checks

| Task | Status | Checks actually passed | Source and task README | Demo evidence |
| --- | --- | --- | --- | --- |
| Notes | Complete locally | Create/read/update/delete API; required field validation; failed mutation leaves saved data intact; browser create/edit/content search; real process restart | `apps/notes/`, `apps/notes/README.md` | `screenshots/notes-desktop.png`, `screenshots/notes-mobile.png`; WALKTHROUGH.md |
| Expenses | Complete locally | Direct invalid requests; exact decimals and negative balance; ordering, deletion, updated totals; browser income/expense submission; real process restart | `apps/expenses/`, `apps/expenses/README.md` | `screenshots/expenses-desktop.png`, `screenshots/expenses-mobile.png`; WALKTHROUGH.md |
| Events | Complete locally | Idempotent seed; registration; normalized duplicate 409; competing requests for final place; admin protection/login/logout/check-in; public contact privacy; browser registration, availability update, admin search/check-in; real process restart | `apps/events/`, `apps/events/README.md` | `screenshots/events-public.png`, `screenshots/events-admin.png`, `screenshots/events-mobile.png`; WALKTHROUGH.md |
| Showcase | Complete locally | URL/field validation; Pending status cannot be overridden publicly; unauthorized approval rejected; Pending/Rejected public detail 404; approval, search, tags and rejection; complete browser submit/approve/gallery/reject flow; real process restart | `apps/showcase/`, `apps/showcase/README.md` | `screenshots/showcase-submission.png`, `screenshots/showcase-admin.png`, `screenshots/showcase-gallery.png`, `screenshots/showcase-mobile.png`; WALKTHROUGH.md |

The latest full run of `npm test` passed **8 tests, 0 failures**. The intentional database-error test logs `no such table: notes` against an in-memory test database and verifies that only a safe generic JSON error reaches the client. It does not damage the application database.

An additional regression test binds an occupied localhost port, launches a second server and checks that it exits with a clear port-in-use message, without a misleading ready message or `null.port` TypeError. Startup now logs readiness on the HTTP server's listening event and handles bind failures separately. The existing server on port 3100 was confirmed healthy; starting a second instance had caused the screenshot error. All eight tests, including successful process startup/restart, passed after the fix.

The strengthened restart test launches an actual server process with a temporary file, creates records for all four apps, approves a project, stops the process, starts a new process on the same database, and checks notes, paisa totals, event availability and the approved gallery. It also confirms old admin sessions no longer work after restart.

`npm run build` passed: 29 modules transformed, production HTML/CSS/JavaScript generated. The HTTP test verifies the generated HTML and referenced JavaScript are served by Express. `npm run export` completed for all four packages.

## Standalone verification

`npm run verify:exports` passed all four packages:

- `codenova-notes`
- `codenova-expense-tracker`
- `codenova-event-registration`
- `codenova-project-showcase`

For each, the verifier copied the source outside the parent workspace to a new temporary folder, ran a clean offline `npm ci`, built the production frontend, launched its own server/database, checked HTTP 200 for the home page and selected app API, confirmed `/api/config` enabled only that app, and confirmed another assignment's endpoint returned 404. These checks did not use the parent's node_modules or database. The source includes shared runtime files intentionally to make each exported package self-contained.

## Browser evidence and limits

Real screenshots are in `docs/screenshots/`; all entries used for this pass were fictional. No passwords, real financial records or personal contact data were captured. Demo project URLs are fictional examples and should not be presented as real deployed projects.

The browser was exercised at desktop and phone breakpoints. At the phone check, the measured CSS viewport was 390 pixels wide and the document was 378 pixels wide, with horizontal scrolling confined to tables/navigation. Mobile captures were saved for the dashboard and all four apps. Dashboard cards were used to open each app and return to Dashboard. The expense form stacked below summary cards at the phone width.

The in-app browser's screenshot capture cropped part of the right edge under this machine's display scaling. Screenshots are genuine, but use the walkthrough to record an uncropped browser demo for submission. Browser automation later stopped because its Windows URL confidence check failed. No further browser automation was attempted after that stop. A complete keyboard/screen-reader audit, every deletion-confirmation interaction and a browser-level simulated network failure were not completed; manual steps are included in WALKTHROUGH.md. Backend deletion/failure consistency was tested automatically.

Initial sandbox test requests were blocked by localhost permissions (EACCES). The same tests passed when rerun with approved localhost access. This was an environment restriction, not an application test failure.

## Reproduce

```powershell
npm ci
npm run build
npm test
npm run export
npm run verify:exports
```

Tests use isolated data. Regular setup and the app's admin credential configuration are documented in the main README. No GitHub repository or public deployment was created during this verification.
