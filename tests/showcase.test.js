import { test } from "node:test";
import assert from "node:assert/strict";
import { harness } from "./helper.js";
test("showcase validates URLs and enforces pending/approved/rejected visibility", async () => {
  const h = await harness("showcase");
  const b = {
    title: "Study Buddy",
    student_name: "Demo Student",
    description: "A collaborative study planner",
    tags: ["React", "Education"],
    github_url: "https://github.com/demo/study-buddy",
    preview_url: "https://example.com/study-buddy",
  };
  try {
    for (const patch of [
      { title: "" },
      { student_name: "" },
      { description: "" },
      { tags: [] },
      { github_url: "javascript:alert(1)" },
      { github_url: "https://evil.example/repo" },
      { preview_url: "ftp://example.com" },
      { preview_url: "https://user:pass@example.com" },
    ])
      assert.equal(
        (await h.req("/projects", "POST", { ...b, ...patch })).status,
        400,
      );
    const p = await h.req("/projects", "POST", { ...b, status: "Approved" });
    assert.equal(p.status, 201);
    const n = p.body.data.id;
    assert.equal(p.body.data.status, "Pending");
    assert.equal((await h.req("/projects")).body.data.length, 0);
    assert.equal((await h.req("/projects/" + n)).status, 404);
    assert.equal(
      (await h.req("/admin/projects/" + n, "PATCH", { status: "Approved" }))
        .status,
      401,
    );
    const login = await h.req("/admin/login", "POST", {
      username: "admin",
      password: "TestPassword2026!",
    });
    assert.equal(
      (
        await h.req(
          "/admin/projects/" + n,
          "PATCH",
          { status: "Approved" },
          login.cookie,
        )
      ).status,
      200,
    );
    assert.equal(
      (await h.req("/projects?tag=react&q=study")).body.data.length,
      1,
    );
    assert.equal((await h.req("/projects?tag=python")).body.data.length, 0);
    assert.equal((await h.req("/projects/" + n)).status, 200);
    assert.equal(
      (
        await h.req(
          "/admin/projects/" + n,
          "PATCH",
          { status: "Rejected" },
          login.cookie,
        )
      ).status,
      200,
    );
    assert.equal((await h.req("/projects")).body.data.length, 0);
    assert.equal((await h.req("/projects/" + n)).status, 404);
    assert.equal(
      (await h.req("/admin/projects", "GET", undefined, login.cookie)).body
        .data[0].status,
      "Rejected",
    );
  } finally {
    await h.close();
  }
});
