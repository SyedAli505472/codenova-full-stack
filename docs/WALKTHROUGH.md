# Demo and screenshot guide

Start with `npm start` after setup and open http://127.0.0.1:3100. Only fictional demonstration entries should be used. The website is fully local; no real bank data, email delivery or remote deployment is required.

## Home

Capture the desktop dashboard with all four Open App cards. Open each card, then use Dashboard in the sidebar to return. Capture a second image at 390 px width using the browser's responsive view.

## Notes

1. Open Notes. Create `Final submission checklist` with content `Verify all four apps, record the demo, and upload the repositories.`
2. Search for `record` to verify content search, then clear the search.
3. Edit the note, append `Ready for review.`, and save. Capture the updated card and editor.
4. Click Delete and Cancel: the card stays. Confirm deletion of a disposable test note: it disappears only after the API succeeds.
5. Leave one demo note, restart the server, refresh: it remains. To check a failed save, use development mode, stop only the backend, attempt an edit, and verify the draft and existing card remain with a connection error.

## Expenses

1. Add Income: `Demo salary`, `100.10`, Salary, `2026-11-05`.
2. Add Expense: `Demo lunch`, `100.20`, Food, `2026-11-05`.
3. On a clean database, capture Total Income PKR 100.10, Total Expenses PKR 100.20, Remaining Balance PKR -0.10, and both history rows.
4. Enter `1.234` or `0` to see validation. Cancel one deletion, then delete the expense and verify PKR 100.10 balance.
5. Restart and confirm remaining records persist. Capture the mobile form and horizontally scrollable history.

## Events — public and admin

1. Run `npm run seed` once. Open Campus Events and capture the event list with places remaining.
2. Register for Build Something Good: Demo Student, `demo@example.com`, Demo College, interest Design. Capture confirmation and reduced places.
3. Register the same email in a different case: a duplicate error appears. API tests also verify simultaneous final-seat requests cannot overbook.
4. Open Admin dashboard. Capture the login form without entering credentials in a screenshot.
5. Log in with ADMIN_USERNAME/ADMIN_PASSWORD from your private `.env`. Capture the private attendee table, search by `demo`, and click Check in. Capture the Checked in badge. Sign out.

## Showcase — public and admin

1. Open Project Showcase → Submit a project. Submit `Study Buddy`, Demo Student, description `A collaborative study planner`, tags `react, education`, GitHub `https://github.com/demo/study-buddy`, preview `https://example.com`. These links are fictional demo values; replace them with your real project links before presenting an actual project.
2. Capture the Pending confirmation. Return to Explore projects: the new submission is absent.
3. Open Admin review, sign in, and review the Pending project. Capture the review card. Approve it.
4. Return to Explore projects: it appears. Search `study` and choose the react tag. Capture the gallery.
5. In Admin review select Approved and reject the project. Return to public gallery: it disappears. The automated tests verify that public detail requests also return 404 for pending/rejected projects.
6. Approve your final demonstration project again if desired for the recording. Sign out when finished.

## Suggested recording order

Dashboard → Notes create/edit/search → Expense decimal totals → Event registration → private attendee check-in → Showcase submission → private approval → public gallery → mobile view. Record only fictional data and avoid showing `.env` or typing passwords on camera.

Real captured screenshots, if present, are in `docs/screenshots/`. See VERIFICATION.md for the exact checks executed; this guide also covers additional manual checks without claiming they were all performed.
