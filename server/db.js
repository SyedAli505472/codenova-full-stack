import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { defaultModule } from "./config.js";
export const modules = ["notes", "expenses", "events", "showcase"];
export function openDatabase(
  filename = process.env.DB_PATH || "./data/full-stack.sqlite",
  selected = process.env.APP_MODULE || defaultModule,
) {
  if (selected !== "all" && !modules.includes(selected))
    throw new Error("Invalid APP_MODULE");
  if (filename !== ":memory:") {
    filename = resolve(filename);
    mkdirSync(dirname(filename), { recursive: true });
  }
  const db = new DatabaseSync(filename);
  db.exec(
    "PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;",
  );
  for (const name of modules.filter(
    (m) => selected === "all" || selected === m,
  )) {
    const schema = new URL(`../apps/${name}/schema.sql`, import.meta.url);
    try {
      db.exec(readFileSync(schema, "utf8"));
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  return db;
}
