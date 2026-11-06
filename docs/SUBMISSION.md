# Final submission guide

## Open and run in VS Code

For this computer:

```powershell
cd 'C:\Users\mozam\OneDrive\Documents\ChatGPT\Intership\Full_Stack_Final'
code .
npm start
```

Open http://127.0.0.1:3100. This existing local copy has dependencies, a production build and a private `.env`. If the server is already running, open the URL directly instead of starting a second copy.

For a freshly extracted download, open its folder in VS Code, then run in its terminal:

```powershell
npm ci
Copy-Item .env.example .env
notepad .env
```

Set `ADMIN_USERNAME` and a unique `ADMIN_PASSWORD` of at least 12 characters. Save, close Notepad, then run:

```powershell
npm run db:init
npm run seed
npm run build
npm test
npm start
```

After setup, `npm start` is the single command to run the dashboard and all four apps. Use the same local admin credentials for Events and Showcase. The ZIP contains no real credentials; set your own in each fresh installation. Stop the server using Ctrl+C in its terminal.

## Download contents

- `Full_Stack_Project.zip`: one folder with the complete suite, schemas, lockfile, tests, README files, VS Code tasks, screenshots and walkthrough.
- `Four_GitHub_Repositories.zip`: four independent repository folders, one per assignment. Each includes its shared runtime files, its own README, `.env.example` and lockfile.

Runtime databases, real `.env` files, dependencies and generated builds are intentionally excluded. The optional event seed recreates fictional sample events. Other records are created during the demonstration.

## Four public GitHub repositories

Create four empty public repositories under your GitHub account using these names:

| Assignment | Repository folder and GitHub name |
| --- | --- |
| Notes | `codenova-notes` |
| Expense Tracker | `codenova-expense-tracker` |
| Event Registration | `codenova-event-registration` |
| Student Showcase | `codenova-project-showcase` |

Extract `Four_GitHub_Repositories.zip` outside this workspace's existing parent Git repository. Alternatively run `npm run export` and copy the four exported folders outside the workspace. Each folder should be a separate repository root.

In a terminal inside **each repository folder**, run the following. Substitute your real GitHub username and the matching name from the table:

```powershell
git init
git add .
git status
git commit -m "Complete CodeNova Full Stack internship assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
git push -u origin main
```

Review `git status` before committing. The supplied `.gitignore` excludes credentials, dependencies, builds and databases. Authenticate to your own GitHub account when Git requests it. Do not upload the parent workspace, older archives, personal data, or `.env`.

## Before sending your submission

1. Add your actual name/student details where CodeNova requires them. No identity details were invented.
2. Record the walkthrough in `docs/WALKTHROUGH.md`, including both Events and Showcase admin flows. Keep `.env` and passwords out of the recording. The screenshot tool on this computer cropped the right edge, so capture a new full-browser recording or screenshots if required.
3. Replace fictional project links if demonstrating a real submitted project. Demo seed data is clearly fictional.
4. Upload to the four public repositories and confirm each link opens while signed out.
5. Submit those real repository links and your demo through CodeNova's official submission channel. The official PDF, submission form and your account credentials were not supplied, so they were not guessed.

See `docs/VERIFICATION.md` for exactly what passed and the remaining manual checks. No upload or hosting URL is claimed until you actually publish it.
