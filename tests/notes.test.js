import { test } from "node:test";
import assert from "node:assert/strict";
import { harness } from "./helper.js";
test("notes CRUD, validation, failed mutations preserve records", async () => {
  const h = await harness("notes");
  try {
    const a = await h.req("/notes", "POST", {
      title: "  Idea  ",
      content: "Learn React",
    });
    assert.equal(a.status, 201);
    assert.equal(a.body.data.title, "Idea");
    const n = a.body.data.id;
    assert.equal(
      (await h.req(`/notes/${n}`, "PUT", { title: "", content: "x" })).status,
      400,
    );
    assert.equal((await h.req(`/notes/${n}`)).body.data.content, "Learn React");
    assert.equal((await h.req("/notes/0", "DELETE")).status, 400);
    assert.equal((await h.req("/notes/999", "DELETE")).status, 404);
    assert.equal((await h.req("/notes")).body.data.length, 1);
    assert.equal(
      (await h.req(`/notes/${n}`, "PUT", { title: "Updated", content: "Done" }))
        .status,
      200,
    );
    assert.equal((await h.req(`/notes/${n}`)).body.data.content, "Done");
    assert.equal((await h.req(`/notes/${n}`, "DELETE")).status, 200);
    assert.equal((await h.req("/notes")).body.data.length, 0);
  } finally {
    await h.close();
  }
});
