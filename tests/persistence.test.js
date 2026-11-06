import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { harness } from "./helper.js";
import { seedEvents } from "../apps/events/seed.js";
test("all module data persists when database and HTTP server reopen", async () => {
  const dir = mkdtempSync(join(tmpdir(), "full-stack-data-")),
    path = join(dir, "db.sqlite");
  let h = await harness("all", path);
  try {
    seedEvents(h.db);
    await h.req("/transactions", "POST", {
      type: "expense",
      description: "Persistent lunch",
      amount: "12.34",
      category: "Food",
      transaction_date: "2026-11-05",
    });
    await h.req("/events/1/registrations", "POST", {
      name: "Demo Student",
      email: "persist@example.com",
      organization: "Demo College",
      interests: ["Design"],
    });
    await h.req("/projects", "POST", {
      title: "Persistent project",
      student_name: "Demo Student",
      description: "Demo description",
      tags: ["react"],
      github_url: "https://github.com/demo/project",
      preview_url: "https://example.com",
    });
    await h.close();
    h = await harness("all", path);
    assert.equal((await h.req("/summary")).body.data.balance_minor, -1234);
    assert.equal((await h.req("/events")).body.data[0].available_places, 29);
    const login = await h.req("/admin/login", "POST", {
      username: "admin",
      password: "TestPassword2026!",
    });
    assert.equal(
      (await h.req("/admin/projects", "GET", undefined, login.cookie)).body
        .data[0].status,
      "Pending",
    );
    assert.equal((await h.req("/projects")).body.data.length, 0);
  } finally {
    await h.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
