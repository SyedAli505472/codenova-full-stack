import React, { useState } from "react";
import {
  api,
  useLoad,
  Field,
  Feedback,
  Loading,
  Empty,
  Title,
} from "../../client/ui.jsx";
const categories = {
  income: ["Salary", "Freelance", "Other Income"],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Other Expense",
  ],
};
const money = (n) =>
  new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", currencyDisplay: "code", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    n / 100,
  );
function fresh() {
  const d = new Date();
  return {
    type: "expense",
    description: "",
    amount: "",
    category: "Food",
    transaction_date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
  };
}
export default function Expenses() {
  const state = useLoad("/transactions"),
    totals = useLoad("/summary");
  const [form, setForm] = useState(fresh),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if (
      !form.description.trim() ||
      !/^\d+(\.\d{1,2})?$/.test(form.amount) ||
      form.amount.trim() !== form.amount ||
      Number(form.amount) <= 0 ||
      Number(form.amount) > 1000000
    ) {
      setError(
        "Enter a description and an amount from PKR 0.01 to 1,000,000, with up to two decimal places.",
      );
      return;
    }
    if (
      !categories[form.type]?.includes(form.category) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(form.transaction_date) ||
      form.transaction_date < "0001-01-01" ||
      !Number.isFinite(Date.parse(form.transaction_date)) ||
      new Date(form.transaction_date).toISOString().slice(0, 10) !==
        form.transaction_date
    ) {
      setError("Choose a valid category and calendar date.");
      return;
    }
    setBusy(true);
    try {
      await api("/transactions", "POST", form);
      setForm(fresh());
      setSuccess("Transaction saved.");
      await Promise.all([state.reload(), totals.reload()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(row) {
    if (!confirm(`Delete “${row.description}” for ${money(row.amount_minor)}?`))
      return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/transactions/${row.id}`, "DELETE");
      setSuccess("Transaction deleted.");
      await Promise.all([state.reload(), totals.reload()]);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Title
        eyebrow="02 / YOUR MONEY"
        title="A little clarity. A better balance."
      >
        Keep track of what comes in and where it goes.
      </Title>
      <Feedback error={error || totals.error} success={success} />
      <section className="summary-grid">
        {[
          ["Total Income", "income_minor"],
          ["Total Expenses", "expenses_minor"],
          ["Remaining Balance", "balance_minor"],
        ].map(([label, key], i) => (
          <article
            key={key}
            className={"summary " + (i === 2 ? "balance" : "")}
          >
            <p>{label}</p>
            <strong>{totals.data ? money(totals.data[key]) : "—"}</strong>
            <small>
              {i === 2 ? "Income minus expenses" : "All recorded transactions"}
            </small>
          </article>
        ))}
      </section>
      <div className="split">
        <section className="panel">
          <h2>Add a transaction</h2>
          <form onSubmit={save}>
            <fieldset disabled={busy}>
              <div className="type-switch">
                {["expense", "income"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={form.type === t ? "selected" : ""}
                    aria-pressed={form.type === t}
                    onClick={() =>
                      setForm({ ...form, type: t, category: categories[t][0] })
                    }
                  >
                    {t === "income" ? "↙ Income" : "↗ Expense"}
                  </button>
                ))}
              </div>
              <Field label="Description">
                <input
                  name="description"
                  value={form.description}
                  onChange={change}
                  required
                  maxLength={120}
                  placeholder="What was it for?"
                />
              </Field>
              <Field label="Amount (PKR)">
                <input
                  name="amount"
                  inputMode="decimal"
                  value={form.amount}
                  onChange={change}
                  required
                  placeholder="0.00"
                />
              </Field>
              <Field label="Category">
                <select name="category" value={form.category} onChange={change}>
                  {categories[form.type].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Transaction date">
                <input
                  type="date"
                  name="transaction_date"
                  value={form.transaction_date}
                  onChange={change}
                  required
                  min="0001-01-01"
                  max="9999-12-31"
                />
              </Field>
              <button className="primary">
                {busy ? "Saving…" : "Add transaction"}
              </button>
            </fieldset>
          </form>
        </section>
        <section className="panel table-panel">
          <h2>
            Transaction history{" "}
            <span className="count">{state.data?.length || 0}</span>
          </h2>
          <Loading state={state} />
          {state.data?.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.description}</strong>
                        <span className="badge">{r.category}</span>
                        <span className="badge">
                          {r.type === "income" ? "Income" : "Expense"}
                        </span>
                      </td>
                      <td>{r.transaction_date}</td>
                      <td className={"money " + r.type}>
                        {r.type === "income" ? "+" : "−"}
                        {money(r.amount_minor)}
                      </td>
                      <td>
                        <button
                          className="delete danger-text"
                          disabled={busy}
                          aria-label={`Delete ${r.description}`}
                          onClick={() => remove(r)}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            !state.loading && (
              <Empty title="A fresh start.">
                Add your first transaction to begin.
              </Empty>
            )
          )}
        </section>
      </div>
    </>
  );
}
