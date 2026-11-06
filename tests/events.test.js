import { test } from "node:test";
import assert from "node:assert/strict";
import { harness } from "./helper.js";
import { seedEvents } from "../apps/events/seed.js";
test("events registration, normalized duplicate, concurrent capacity and admin protection", async () => {
  const h = await harness("events");
  try {
    seedEvents(h.db);
    seedEvents(h.db);
    assert.equal((await h.req("/events")).body.data.length, 3);
    h.db.prepare("UPDATE events SET capacity=2 WHERE id=1").run();
    const b = {
      name: "Demo Student",
      email: " demo@EXAMPLE.com ",
      organization: "Demo College",
      interests: ["Design"],
    };
    assert.equal((await h.req("/admin/attendees")).status, 401);
    assert.equal(
      (await h.req("/events/1/registrations", "POST", b)).status,
      201,
    );
    assert.equal(
      (
        await h.req("/events/1/registrations", "POST", {
          ...b,
          email: "DEMO@example.COM",
        })
      ).status,
      409,
    );
    const results = await Promise.all(
      ["a", "b", "c"].map((x) =>
        h.req("/events/1/registrations", "POST", {
          ...b,
          email: x + "@example.com",
        }),
      ),
    );
    assert.equal(results.filter((r) => r.status === 201).length, 1);
    assert.equal(results.filter((r) => r.status === 409).length, 2);
    assert.equal((await h.req("/events")).body.data[0].available_places, 0);
    assert.equal(
      JSON.stringify((await h.req("/events")).body).includes("email"),
      false,
    );
    assert.equal(
      (
        await h.req("/admin/login", "POST", {
          username: "admin",
          password: "wrong",
        })
      ).status,
      401,
    );
    const login = await h.req("/admin/login", "POST", {
      username: "admin",
      password: "TestPassword2026!",
    });
    assert.equal(login.status, 200);
    assert.ok(login.cookie);
    const list = await h.req(
      "/admin/attendees?q=demo@example.com",
      "GET",
      undefined,
      login.cookie,
    );
    assert.equal(list.status, 200);
    assert.equal(list.body.data[0].email, "demo@example.com");
    assert.equal(
      (
        await h.req(
          "/admin/attendees/1",
          "PATCH",
          { status: "Checked in" },
          login.cookie,
        )
      ).status,
      200,
    );
    await h.req("/admin/logout", "POST", {}, login.cookie);
    assert.equal(
      (await h.req("/admin/attendees", "GET", undefined, login.cookie)).status,
      401,
    );
  } finally {
    await h.close();
  }
});
