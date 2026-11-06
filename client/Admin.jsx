import React, { useEffect, useState } from "react";
import { api, Field, Feedback } from "./ui.jsx";
export default function Admin({ children }) {
  const [signed, setSigned] = useState(false),
    [checking, setChecking] = useState(true),
    [busy, setBusy] = useState(false),
    [form, setForm] = useState({ username: "", password: "" }),
    [error, setError] = useState("");
  useEffect(() => {
    api("/admin/session")
      .then(() => setSigned(true))
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setChecking(false));
  }, []);
  async function login(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/admin/login", "POST", form);
      setForm({ username: "", password: "" });
      setSigned(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (checking) return <p role="status">Checking admin session…</p>;
  if (signed)
    return (
      <>
        <div className="admin-bar">
          <span className="badge approved">Admin workspace</span>
          <button
            className="secondary"
            onClick={async () => {
              try {
                await api("/admin/logout", "POST");
                setSigned(false);
              } catch (e) {
                setError(e.message);
              }
            }}
          >
            Sign out
          </button>
        </div>
        <Feedback error={error} />
        {children}
      </>
    );
  return (
    <section className="panel admin-login">
      <p className="eyebrow">PRIVATE WORKSPACE</p>
      <h2>Welcome back, admin.</h2>
      <p className="hint">Sign in to manage your community.</p>
      <Feedback error={error} />
      <form onSubmit={login}>
        <fieldset disabled={busy}>
          <Field label="Username">
            <input
              required
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
          </Field>
          <Field label="Password">
            <input
              required
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </Field>
          <button className="primary">
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
