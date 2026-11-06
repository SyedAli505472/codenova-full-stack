import { openDatabase } from "../server/db.js";
import { seedEvents } from "../apps/events/seed.js";
import { defaultModule } from "../server/config.js";
const db = openDatabase();
const selected = process.env.APP_MODULE || defaultModule;
if (process.argv.includes("--seed")) {
  if (selected === "all" || selected === "events") seedEvents(db);
  console.log(
    "Fictional sample events seeded (idempotent). Other modules start empty.",
  );
} else console.log("Database initialized.");
db.close();
