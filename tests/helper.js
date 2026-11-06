import { once } from "node:events";
import { createApp } from "../server/app.js";
import { openDatabase } from "../server/db.js";
export async function harness(module = "all", filename = ":memory:") {
  const db = openDatabase(filename, module);
  const server = createApp(db, {
    module,
    username: "admin",
    password: "TestPassword2026!",
  }).listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    db,
    base,
    async req(path, method = "GET", body, cookie) {
      const res = await fetch(base + "/api" + path, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      return {
        status: res.status,
        body: await res.json(),
        cookie: res.headers.get("set-cookie")?.split(";")[0],
      };
    },
    async close() {
      await new Promise((r) => server.close(r));
      db.close();
    },
  };
}
