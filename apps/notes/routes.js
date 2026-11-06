import { body, text, id, found } from "../../server/utils.js";
export function registerNotes(app, db) {
  app.get("/api/notes", (req, res) =>
    res.json({
      data: db
        .prepare("SELECT * FROM notes ORDER BY updated_at DESC,id DESC")
        .all(),
    }),
  );
  app.get("/api/notes/:id", (req, res) =>
    res.json({
      data: found(
        db.prepare("SELECT * FROM notes WHERE id=?").get(id(req.params.id)),
      ),
    }),
  );
  app.post("/api/notes", (req, res) => {
    const b = body(req);
    const title = text(b.title, "Title"),
      content = text(b.content, "Content", 5000);
    const r = db
      .prepare("INSERT INTO notes(title,content) VALUES (?,?)")
      .run(title, content);
    res
      .status(201)
      .json({
        data: db
          .prepare("SELECT * FROM notes WHERE id=?")
          .get(Number(r.lastInsertRowid)),
      });
  });
  app.put("/api/notes/:id", (req, res) => {
    const n = id(req.params.id),
      b = body(req);
    const title = text(b.title, "Title"),
      content = text(b.content, "Content", 5000);
    found(db.prepare("SELECT id FROM notes WHERE id=?").get(n));
    db.prepare(
      "UPDATE notes SET title=?,content=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id=?",
    ).run(title, content, n);
    res.json({ data: db.prepare("SELECT * FROM notes WHERE id=?").get(n) });
  });
  app.delete("/api/notes/:id", (req, res) => {
    const n = id(req.params.id);
    found(db.prepare("SELECT id FROM notes WHERE id=?").get(n));
    db.prepare("DELETE FROM notes WHERE id=?").run(n);
    res.json({ data: { id: n, deleted: true } });
  });
}
