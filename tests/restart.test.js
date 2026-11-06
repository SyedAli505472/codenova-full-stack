import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../server/db.js";
import { seedEvents } from "../apps/events/seed.js";
test("all four apps survive a real server process restart", async () => {
  const dir = mkdtempSync(join(tmpdir(), "full-stack-restart-"));
  const database = openDatabase(join(dir, "test.sqlite"), "all");
  seedEvents(database);
  database.close();
  let child;
  async function start() {
    child = spawn(process.execPath, ["server/index.js"], {
      env: {
        ...process.env,
        PORT: "0",
        DB_PATH: join(dir, "test.sqlite"),
        APP_MODULE: "all",
        ADMIN_USERNAME: "test-admin",
        ADMIN_PASSWORD: "RestartTestPassword!2026",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Startup timeout")),
        10000,
      );
      child.stdout.on("data", (data) => {
        const match = String(data).match(/http:\/\/127.0.0.1:\d+/);
        if (match) {
          clearTimeout(timer);
          resolve(match[0]);
        }
      });
      child.on("error", reject);
    });
  }
  async function stop() {
    const done = once(child, "exit");
    child.kill();
    await done;
    child = null;
  }
  try {
    let url = await start();
    const post = (path, data) => fetch(url + "/api" + path, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    assert.equal(
      (
        await fetch(url + "/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Persistent idea",
            content: "Saved on disk",
          }),
        })
      ).status,
      201,
    );
    assert.equal((await post("/transactions", {
      type: "expense", description: "Persistent expense", amount: "12.34",
      category: "Food", transaction_date: "2026-11-06",
    })).status, 201);
    assert.equal((await post("/events/1/registrations", {
      name: "Fictional Student", email: "restart@example.com",
      organization: "Fictional College", interests: ["Design"],
    })).status, 201);
    const project = await post("/projects", {
      title: "Persistent showcase", student_name: "Fictional Student",
      description: "A fictional restart test", tags: ["react"],
      github_url: "https://github.com/demo/restart", preview_url: "https://example.com",
    });
    assert.equal(project.status, 201);
    const projectId = (await project.json()).data.id;
    const login = await post("/admin/login", {
      username: "test-admin", password: "RestartTestPassword!2026",
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get("set-cookie").split(";")[0];
    assert.equal((await fetch(url + `/api/admin/projects/${projectId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json", Cookie: cookie },
      body: JSON.stringify({ status: "Approved" }),
    })).status, 200);
    await stop();
    url = await start();
    const rows = await (await fetch(url + "/api/notes")).json();
    assert.equal(rows.data[0].title, "Persistent idea");
    const get = async (path) => (await (await fetch(url + "/api" + path)).json()).data;
    assert.equal((await get("/summary")).balance_minor, -1234);
    assert.equal((await get("/events"))[0].available_places, 29);
    assert.equal((await get("/projects"))[0].id, projectId);
    assert.equal((await fetch(url + "/api/admin/session", { headers: { Cookie: cookie } })).status, 401);
  } finally {
    if (child) await stop();
    rmSync(dir, { recursive: true, force: true });
  }
});
