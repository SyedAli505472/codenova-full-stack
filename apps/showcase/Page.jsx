import React, { useState } from "react";
import Admin from "../../client/Admin.jsx";
import {
  api,
  useLoad,
  Field,
  Feedback,
  Loading,
  Empty,
  Title,
} from "../../client/ui.jsx";
function ProjectCard({ project: p, actions }) {
  return (
    <article className="project-card">
      <div className="project-cover">
        <span>✧</span>
        <small>STUDENT / BUILT WITH CURIOSITY</small>
      </div>
      <div className="project-body">
        <h3>{p.title}</h3>
        <span className="byline">BY {p.student_name}</span>
        <p>{p.description}</p>
        <div>
          {p.tags.map((t) => (
            <span className="badge" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="project-links">
          <a href={p.github_url} target="_blank" rel="noopener noreferrer">
            GitHub ↗
          </a>
          <a href={p.preview_url} target="_blank" rel="noopener noreferrer">
            Live preview ↗
          </a>
        </div>
        {actions}
      </div>
    </article>
  );
}
function Review() {
  const s = useLoad("/admin/projects"),
    [filter, setFilter] = useState("Pending"),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  async function review(p, status) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const saved = await api(`/admin/projects/${p.id}`, "PATCH", { status });
      s.setData((rows) => rows.map((r) => (r.id === saved.id ? saved : r)));
      setSuccess(`${p.title}: ${status.toLowerCase()}.`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const rows =
    s.data?.filter((p) => filter === "All" || p.status === filter) || [];
  return (
    <>
      <div className="section-bar">
        <h2>Review submissions</h2>
        <select
          aria-label="Filter submission status"
          style={{ width: 160 }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          {["Pending", "Approved", "Rejected", "All"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      <Feedback error={error} success={success} />
      <Loading state={s} />
      <div className="project-grid">
        {rows.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            actions={
              <div className="card-bottom">
                <span className={"badge " + p.status.toLowerCase()}>
                  {p.status}
                </span>
                <div>
                  <button
                    disabled={busy || p.status === "Approved"}
                    onClick={() => review(p, "Approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="danger-text"
                    disabled={busy || p.status === "Rejected"}
                    onClick={() => review(p, "Rejected")}
                  >
                    Reject
                  </button>
                </div>
              </div>
            }
          />
        ))}
      </div>
      {!s.loading && !rows.length && (
        <Empty title="You're all caught up.">
          No submissions in this category.
        </Empty>
      )}
    </>
  );
}
const initial = {
  title: "",
  student_name: "",
  description: "",
  tags: "",
  github_url: "",
  preview_url: "",
};
export default function Showcase() {
  const s = useLoad("/projects"),
    [tab, setTab] = useState("gallery"),
    [q, setQ] = useState(""),
    [tag, setTag] = useState(""),
    [form, setForm] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const tags = [...new Set((s.data || []).flatMap((p) => p.tags))].sort(),
    rows = (s.data || []).filter(
      (p) =>
        (
          p.title +
          " " +
          p.description +
          " " +
          p.student_name +
          " " +
          p.tags.join(" ")
        )
          .toLowerCase()
          .includes(q.toLowerCase()) &&
        (!tag || p.tags.includes(tag)),
    );
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await api("/projects", "POST", {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setForm(initial);
      setSuccess(
        "Project submitted! It will appear in the gallery after admin approval.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Title
        eyebrow="04 / YOUR NEXT BIG THING"
        title="Small projects. Big possibilities."
      >
        Made by students. Built with curiosity. Explore what comes next.
      </Title>
      <div className="tabs">
        {[
          ["gallery", "Explore projects"],
          ["submit", "Submit a project"],
          ["admin", "Admin review"],
        ].map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "selected" : ""}
            onClick={() => {
              setTab(key);
              setError("");
              setSuccess("");
              if (key === "gallery") s.reload();
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "admin" ? (
        <Admin>
          <Review />
        </Admin>
      ) : tab === "submit" ? (
        <section className="panel submit-form">
          <h2>Give your work a place to shine.</h2>
          <p className="hint">
            New projects are reviewed before they appear in the public gallery.
          </p>
          <Feedback error={error} success={success} />
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              <div className="form-columns">
                {[
                  ["title", "Project title"],
                  ["student_name", "Student name"],
                ].map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      required
                      maxLength={120}
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                    />
                  </Field>
                ))}
              </div>
              <Field label="Description">
                <textarea
                  required
                  maxLength={2000}
                  rows={5}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Field>
              <Field label="Tags (1–5, separated by commas)">
                <input
                  required
                  value={form.tags}
                  placeholder="react, education, accessibility"
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </Field>
              <Field label="GitHub repository URL">
                <input
                  required
                  type="url"
                  maxLength={500}
                  placeholder="https://github.com/username/project"
                  value={form.github_url}
                  onChange={(e) =>
                    setForm({ ...form, github_url: e.target.value })
                  }
                />
              </Field>
              <Field label="Live preview URL">
                <input
                  required
                  type="url"
                  maxLength={500}
                  placeholder="https://your-project.example.com"
                  value={form.preview_url}
                  onChange={(e) =>
                    setForm({ ...form, preview_url: e.target.value })
                  }
                />
              </Field>
              <button className="primary">
                {busy ? "Submitting…" : "Submit for review"}
              </button>
            </fieldset>
          </form>
        </section>
      ) : (
        <>
          <div className="section-bar">
            <h2>The student collection</h2>
            <input
              className="search"
              aria-label="Search projects"
              placeholder="Search projects, people or ideas…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="filter-tags">
            <button
              className={!tag ? "selected" : ""}
              onClick={() => setTag("")}
            >
              All projects
            </button>
            {tags.map((t) => (
              <button
                className={tag === t ? "selected" : ""}
                key={t}
                onClick={() => setTag(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <Loading state={s} />
          <div className="project-grid">
            {rows.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          {!s.loading && !rows.length && (
            <Empty title="There's room for your next idea.">
              No projects match yet. Submit your work or try another filter.
            </Empty>
          )}
        </>
      )}
    </>
  );
}
