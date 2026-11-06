# Expense Tracker

React + Express + SQLite income/expense tracker using PKR and integer paisa. Source: `apps/expenses/Page.jsx`, `routes.js`, `validation.js`, `schema.sql`. Summary totals come from SQLite records, including negative balances. History orders by transaction date descending then ID descending.

## Setup and run

Node 24 LTS and npm required. From the package root: `npm ci`, copy `.env.example` to `.env`, `npm run db:init`, `npm run build`, `npm start`. Open `http://127.0.0.1:3100/#expenses`. For standalone use, set `APP_MODULE=expenses` or export `codenova-expense-tracker` with `npm run export`. PORT defaults to 3100; DB_PATH defaults to `./data/full-stack.sqlite`. Admin credentials are unnecessary. Startup never adds sample transactions.

## API and model

| Endpoint                     | Behavior                                              |
| ---------------------------- | ----------------------------------------------------- |
| POST /api/transactions       | Validate and create a transaction; 201                |
| GET /api/transactions        | Ordered transaction list; 200                         |
| DELETE /api/transactions/:id | Delete; 200, missing record 404                       |
| GET /api/summary             | income_minor, expenses_minor, balance_minor, currency |

Example POST: `{ "type": "income", "description": "Salary", "amount": "100.10", "category": "Salary", "transaction_date": "2026-11-05" }`. Returns `{ "data": { "id": 1, "type": "income", "description": "Salary", "amount_minor": 10010, "category": "Salary", "transaction_date": "2026-11-05", "created_at": "UTC timestamp" } }`.

Summary example: `{ "data": { "income_minor": 10010, "expenses_minor": 10020, "balance_minor": -10, "currency": "PKR" } }`. All response amounts are integer paisa. Errors use `{ "error": { "message": "..." } }` and invalid input returns 400.

Required fields validated independently in UI/API. Amount range PKR 0.01–1,000,000, at most two decimals. Description trimmed to 1–120 characters. Dates must be valid YYYY-MM-DD, years 0001–9999. Income categories: Salary, Freelance, Other Income. Expense categories: Food, Transport, Shopping, Bills, Health, Education, Other Expense. Table columns: ID, type, description, category, amount_minor, transaction_date, created_at. No floating-point sums or currency conversion.

## Testing and demo

`npm run build` then `npm test`; focused test `node --test tests/expenses.test.js tests/persistence.test.js`. Demonstrate 100.10 income and 100.20 expense, -0.10 balance, deletion and restart. See `docs/WALKTHROUGH.md` and `docs/VERIFICATION.md`. Suggested public repository: **codenova-expense-tracker**; upload from its export folder using the main README commands.
