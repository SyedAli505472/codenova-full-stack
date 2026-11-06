import { body, text, id, found, fail } from "../../server/utils.js";
function url(value, label, github = false) {
  const raw = text(value, label, 500);
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw fail(400, `${label} must be a valid HTTPS URL.`);
  }
  if (
    u.protocol !== "https:" ||
    u.username ||
    u.password ||
    !u.hostname.includes(".") ||
    (github &&
      (u.hostname.toLowerCase() !== "github.com" ||
        u.pathname.split("/").filter(Boolean).length < 2))
  )
    throw fail(
      400,
      github
        ? "GitHub link must be an HTTPS github.com repository URL."
        : `${label} must be an HTTPS URL without embedded credentials.`,
    );
  return u.href;
}
const decode = (row) => ({ ...row, tags: JSON.parse(row.tags) });
export function registerShowcase(app, db, guard) {
  app.post("/api/projects", (req, res) => {
    const b = body(req),
      title = text(b.title, "Project title"),
      student = text(b.student_name, "Student name"),
      description = text(b.description, "Description", 2000);
    if (
      !Array.isArray(b.tags) ||
      !b.tags.length ||
      b.tags.length > 5 ||
      b.tags.some(
        (t) => typeof t !== "string" || !t.trim() || t.trim().length > 24,
      )
    )
      throw fail(400, "Provide 1–5 tags, each 1–24 characters.");
    const tags = [...new Set(b.tags.map((t) => t.trim().toLowerCase()))],
      github = url(b.github_url, "GitHub link", true),
      preview = url(b.preview_url, "Live preview URL");
    const r = db
      .prepare(
        "INSERT INTO projects(title,student_name,description,tags,github_url,preview_url) VALUES(?,?,?,?,?,?)",
      )
      .run(title, student, description, JSON.stringify(tags), github, preview);
    res
      .status(201)
      .json({ data: { id: Number(r.lastInsertRowid), status: "Pending" } });
  });
  app.get("/api/projects", (req, res) => {
    let rows = db
      .prepare(
        "SELECT * FROM projects WHERE status='Approved' ORDER BY id DESC",
      )
      .all()
      .map(decode);
    const q =
        typeof req.query.q === "string"
          ? req.query.q.toLowerCase().slice(0, 200)
          : "",
      tag =
        typeof req.query.tag === "string" ? req.query.tag.toLowerCase() : "";
    rows = rows.filter(
      (r) =>
        (
          r.title +
          " " +
          r.student_name +
          " " +
          r.description +
          " " +
          r.tags.join(" ")
        )
          .toLowerCase()
          .includes(q) &&
        (!tag || r.tags.includes(tag)),
    );
    res.json({ data: rows });
  });
  app.get("/api/projects/:id", (req, res) =>
    res.json({
      data: decode(
        found(
          db
            .prepare("SELECT * FROM projects WHERE id=? AND status='Approved'")
            .get(id(req.params.id)),
        ),
      ),
    }),
  );
  app.get("/api/admin/projects", ...guard, (req, res) =>
    res.json({
      data: db
        .prepare("SELECT * FROM projects ORDER BY id DESC")
        .all()
        .map(decode),
    }),
  );
  app.patch("/api/admin/projects/:id", ...guard, (req, res) => {
    const n = id(req.params.id),
      b = body(req);
    if (!["Approved", "Rejected"].includes(b.status))
      throw fail(400, "Choose Approved or Rejected.");
    found(db.prepare("SELECT id FROM projects WHERE id=?").get(n));
    db.prepare(
      "UPDATE projects SET status=?,reviewed_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?",
    ).run(b.status, n);
    res.json({
      data: decode(db.prepare("SELECT * FROM projects WHERE id=?").get(n)),
    });
  });
}
