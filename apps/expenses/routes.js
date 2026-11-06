import { validate, minorUnits } from "./validation.js";
import { fail, id, found } from "../../server/utils.js";
export function registerExpenses(app, db) {
  app.get("/api/transactions", (req, res) =>
    res.json({
      data: db
        .prepare(
          "SELECT * FROM transactions ORDER BY transaction_date DESC,id DESC",
        )
        .all(),
    }),
  );
  app.post("/api/transactions", (req, res) => {
    const errors = validate(req.body);
    if (Object.keys(errors).length)
      throw fail(400, Object.values(errors).join(" "));
    const b = req.body;
    const r = db
      .prepare(
        "INSERT INTO transactions(type,description,category,amount_minor,transaction_date) VALUES(?,?,?,?,?)",
      )
      .run(
        b.type,
        b.description.trim(),
        b.category,
        minorUnits(b.amount),
        b.transaction_date,
      );
    res
      .status(201)
      .json({
        data: db
          .prepare("SELECT * FROM transactions WHERE id=?")
          .get(Number(r.lastInsertRowid)),
      });
  });
  app.delete("/api/transactions/:id", (req, res) => {
    const n = id(req.params.id);
    found(db.prepare("SELECT id FROM transactions WHERE id=?").get(n));
    db.prepare("DELETE FROM transactions WHERE id=?").run(n);
    res.json({ data: { id: n, deleted: true } });
  });
  app.get("/api/summary", (req, res) => {
    const t = db
      .prepare(
        "SELECT COALESCE(SUM(CASE WHEN type='income' THEN amount_minor ELSE 0 END),0) AS income_minor,COALESCE(SUM(CASE WHEN type='expense' THEN amount_minor ELSE 0 END),0) AS expenses_minor FROM transactions",
      )
      .get();
    res.json({
      data: {
        ...t,
        balance_minor: t.income_minor - t.expenses_minor,
        currency: "PKR",
      },
    });
  });
}
