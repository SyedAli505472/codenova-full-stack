import { test } from "node:test";
import assert from "node:assert/strict";
import { harness } from "./helper.js";
test("malformed requests, database errors, cross-origin admin and build serving", async () => {
  const h = await harness();
  try {
    let r = await fetch(h.base + "/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{bad",
    });
    assert.equal(r.status, 400);
    assert.equal((await h.req("/notes", "POST", [])).status, 400);
    assert.equal((await h.req("/unknown")).status, 404);
    r = await fetch(h.base + "/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://foreign.example",
      },
      body: JSON.stringify({
        username: "admin",
        password: "TestPassword2026!",
      }),
    });
    assert.equal(r.status, 403);
    const page = await fetch(h.base);
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /<title>Full Stack/);
    const asset = html.match(/src="([^"]+\.js)"/)[1];
    assert.equal((await fetch(h.base + asset)).status, 200);
    h.db.exec("DROP TABLE notes");
    const bad = await h.req("/notes");
    assert.equal(bad.status, 500);
    assert.equal(
      bad.body.error.message,
      "Unable to complete the request. Please try again.",
    );
  } finally {
    await h.close();
  }
});
