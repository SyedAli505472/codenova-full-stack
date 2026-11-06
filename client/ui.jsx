import React, { useState, useEffect, useRef } from "react";
export async function api(path, method = "GET", body) {
  let res;
  try {
    res = await fetch("/api" + path, {
      method,
      credentials: "same-origin",
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the server. Start the application and try again.",
    );
  }
  let payload;
  try {
    payload = await res.json();
  } catch {
    throw new Error(
      "The server returned an unexpected response. Please restart it.",
    );
  }
  if (!res.ok)
    throw Object.assign(
      new Error(payload.error?.message || "Request failed."),
      { status: res.status },
    );
  return payload.data;
}
export function useLoad(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const active = useRef(true);
  async function reload() {
    setLoading(true);
    setError("");
    try {
      const d = await api(path);
      if (active.current) setData(d);
      return d;
    } catch (e) {
      if (active.current) setError(e.message);
    } finally {
      if (active.current) setLoading(false);
    }
  }
  useEffect(() => {
    active.current = true;
    reload();
    return () => {
      active.current = false;
    };
  }, [path]);
  return { data, setData, error, loading, reload };
}
export function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Feedback({ error, success }) {
  return (
    <div aria-live="polite">
      {error && (
        <div role="alert" className="message error">
          {error}
        </div>
      )}
      {success && (
        <div role="status" className="message success">
          {success}
        </div>
      )}
    </div>
  );
}
export function Loading({ state }) {
  return (
    <>
      {state.loading && (
        <p role="status" className="muted">
          Loading…
        </p>
      )}
      {state.error && (
        <div className="message error" role="alert">
          {state.error} <button onClick={state.reload}>Retry</button>
        </div>
      )}
    </>
  );
}
export function Empty({ title = "Nothing here yet.", children }) {
  return (
    <div className="empty">
      <span>◇</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function Title({ eyebrow, title, children, action }) {
  return (
    <div className="page-title">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{children}</p>
      </div>
      {action}
    </div>
  );
}
