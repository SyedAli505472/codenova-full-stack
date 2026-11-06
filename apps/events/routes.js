import { body, text, id, found, fail } from "../../server/utils.js";
export const interests = [
  "Web Development",
  "Design",
  "AI & Data",
  "Mobile",
  "Cybersecurity",
];
const listing =
  "SELECT e.*,e.capacity-(SELECT COUNT(*) FROM registrations r WHERE r.event_id=e.id) AS available_places FROM events e ORDER BY e.schedule,e.id";
export function registerEvents(app, db, guard) {
  app.get("/api/events", (req, res) =>
    res.json({ data: db.prepare(listing).all() }),
  );
  app.post("/api/events/:id/registrations", (req, res) => {
    const n = id(req.params.id),
      b = body(req),
      name = text(b.name, "Name"),
      organization = text(b.organization, "College or organization"),
      email = text(b.email, "Email", 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      throw fail(400, "Enter a valid email address.");
    if (
      !Array.isArray(b.interests) ||
      !b.interests.length ||
      b.interests.length > 5 ||
      b.interests.some((i) => !interests.includes(i))
    )
      throw fail(400, "Choose at least one supported domain interest.");
    db.exec("BEGIN IMMEDIATE");
    try {
      const event = found(db.prepare("SELECT * FROM events WHERE id=?").get(n));
      if (
        db
          .prepare("SELECT id FROM registrations WHERE event_id=? AND email=?")
          .get(n, email)
      )
        throw fail(409, "This email is already registered for this event.");
      const count = db
        .prepare("SELECT COUNT(*) AS n FROM registrations WHERE event_id=?")
        .get(n).n;
      if (count >= event.capacity)
        throw fail(409, "This event is full. Please choose another event.");
      const r = db
        .prepare(
          "INSERT INTO registrations(event_id,name,email,organization,interests) VALUES(?,?,?,?,?)",
        )
        .run(
          n,
          name,
          email,
          organization,
          JSON.stringify([...new Set(b.interests)]),
        );
      db.exec("COMMIT");
      res
        .status(201)
        .json({
          data: {
            id: Number(r.lastInsertRowid),
            event_id: n,
            status: "Confirmed",
            available_places: event.capacity - count - 1,
          },
        });
    } catch (e) {
      db.exec("ROLLBACK");
      throw e;
    }
  });
  app.get("/api/admin/attendees", ...guard, (req, res) => {
    const q =
      typeof req.query.q === "string" ? req.query.q.trim().slice(0, 200) : "";
    const rows = db
      .prepare(
        "SELECT r.*,e.title AS event_title FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.name LIKE ? OR r.email LIKE ? OR r.organization LIKE ? OR e.title LIKE ? ORDER BY r.id DESC",
      )
      .all(...Array(4).fill("%" + q + "%"));
    res.json({
      data: rows.map((r) => ({ ...r, interests: JSON.parse(r.interests) })),
    });
  });
  app.patch("/api/admin/attendees/:id", ...guard, (req, res) => {
    const n = id(req.params.id),
      b = body(req);
    if (!["Confirmed", "Checked in"].includes(b.status))
      throw fail(400, "Unsupported attendee status.");
    found(db.prepare("SELECT id FROM registrations WHERE id=?").get(n));
    db.prepare("UPDATE registrations SET status=? WHERE id=?").run(b.status, n);
    res.json({ data: { id: n, status: b.status } });
  });
}
