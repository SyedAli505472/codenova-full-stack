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
export default function Notes() {
  const state = useLoad("/notes");
  const [form, setForm] = useState({ title: "", content: "" }),
    [editing, setEditing] = useState(null),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  async function save(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    if (!form.title.trim() || !form.content.trim()) {
      setError("Title and content are required.");
      return;
    }
    setBusy(true);
    try {
      const note = await api(
        editing ? `/notes/${editing}` : "/notes",
        editing ? "PUT" : "POST",
        form,
      );
      state.setData((rows) => [
        note,
        ...(rows || []).filter((n) => n.id !== note.id),
      ]);
      setEditing(null);
      setForm({ title: "", content: "" });
      setSuccess("Note saved.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function remove(note) {
    if (!confirm(`Delete “${note.title}”?`)) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(`/notes/${note.id}`, "DELETE");
      state.setData((rows) => rows.filter((n) => n.id !== note.id));
      if (editing === note.id) {
        setEditing(null);
        setForm({ title: "", content: "" });
      }
      setSuccess("Note deleted.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const rows = (state.data || []).filter((n) =>
    (n.title + " " + n.content).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Title eyebrow="01 / YOUR IDEAS" title="Make room for a good idea.">
        A quiet place for your plans, thoughts and next steps.
      </Title>
      <Feedback error={error} success={success} />
      <div className="split">
        <section className="panel editor">
          <h2>{editing ? "Edit note" : "Write a note"}</h2>
          <form onSubmit={save}>
            <fieldset disabled={busy}>
              <Field label="Title">
                <input
                  name="title"
                  value={form.title}
                  onChange={change}
                  maxLength={120}
                  required
                  placeholder="Give your idea a name"
                />
              </Field>
              <Field label="Content">
                <textarea
                  name="content"
                  value={form.content}
                  onChange={change}
                  maxLength={5000}
                  required
                  rows={9}
                  placeholder="Start writing…"
                />
              </Field>
              <button className="primary">
                {busy ? "Saving…" : editing ? "Save changes" : "Add note"}
              </button>
              {editing && (
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setEditing(null);
                    setForm({ title: "", content: "" });
                  }}
                >
                  Cancel editing
                </button>
              )}
            </fieldset>
          </form>
        </section>
        <section>
          <div className="section-bar">
            <h2>
              Your notebook{" "}
              <span className="count">{state.data?.length || 0}</span>
            </h2>
            <input
              className="search"
              aria-label="Search notes"
              placeholder="Search titles and content…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Loading state={state} />
          <div className="note-grid">
            {rows.map((n) => (
              <article className="note" key={n.id}>
                <span className="eyebrow">
                  NOTE / {String(n.id).padStart(2, "0")}
                </span>
                <h3>{n.title}</h3>
                <p className="note-content">{n.content}</p>
                <div className="card-bottom">
                  <small>
                    {new Date(n.updated_at).toLocaleDateString("en-GB")}
                  </small>
                  <div>
                    <button
                      disabled={busy}
                      onClick={() => {
                        setEditing(n.id);
                        setForm({ title: n.title, content: n.content });
                        document
                          .querySelector(".editor")
                          .scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger-text"
                      disabled={busy}
                      onClick={() => remove(n)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!state.loading && !rows.length && (
            <Empty
              title={
                search ? "No matching notes." : "Your next idea starts here."
              }
            >
              Write a note to begin your collection.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
