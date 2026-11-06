import { readFileSync } from "node:fs";
export const defaultModule = JSON.parse(
  readFileSync(new URL("../app-config.json", import.meta.url), "utf8"),
).module;
