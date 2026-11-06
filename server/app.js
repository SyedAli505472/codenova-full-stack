import express from "express";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { modules } from "./db.js";
import { defaultModule } from "./config.js";
import { registerNotes } from "../apps/notes/routes.js";
import { registerExpenses } from "../apps/expenses/routes.js";
import { registerAuth } from "./auth.js";
import { registerEvents } from "../apps/events/routes.js";
import { registerShowcase } from "../apps/showcase/routes.js";
export function createApp(db, options = {}) {
  const app = express();
  const selected = options.module || process.env.APP_MODULE || defaultModule;
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  app.get("/api/health", (req, res) => {
    db.prepare("SELECT 1").get();
    res.json({ data: { status: "ok", module: selected } });
  });
  app.get("/api/config", (req, res) =>
    res.json({ data: { modules: selected === "all" ? modules : [selected] } }),
  );
  if (selected === "all" || selected === "notes") registerNotes(app, db);
  if (selected === "all" || selected === "expenses") registerExpenses(app, db);
  const guard = registerAuth(app, options);
  if (selected === "all" || selected === "events")
    registerEvents(app, db, guard);
  if (selected === "all" || selected === "showcase")
    registerShowcase(app, db, guard);
  app.use("/api", (req, res) =>
    res.status(404).json({ error: { message: "API endpoint not found." } }),
  );
  const dist = fileURLToPath(new URL("../dist/", import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get("/{*path}", (req, res) => res.sendFile(dist + "index.html"));
  }
  app.use((err, req, res, next) => {
    const status =
      err.type === "entity.parse.failed"
        ? 400
        : err.type === "entity.too.large"
          ? 413
          : err.status || 500;
    if (status === 500) console.error("Database/request failure:", err.message);
    res
      .status(status)
      .json({
        error: {
          message:
            status === 500
              ? "Unable to complete the request. Please try again."
              : err.type === "entity.parse.failed"
                ? "Malformed JSON body."
                : err.message,
        },
      });
  });
  return app;
}
