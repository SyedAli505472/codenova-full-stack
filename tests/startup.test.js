import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:net";
import { once } from "node:events";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

test("occupied port reports a clear startup error without logging readiness or crashing on null.port", async () => {
  const blocker = createServer();
  blocker.listen(0, "127.0.0.1");
  await once(blocker, "listening");
  const port = blocker.address().port;
  try {
    await assert.rejects(
      promisify(execFile)(process.execPath, ["server/index.js"], {
        env: { ...process.env, PORT: String(port), DB_PATH: ":memory:", APP_MODULE: "notes" },
        timeout: 10000,
      }),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(error.stderr, new RegExp(`port ${port} is already in use`));
        assert.doesNotMatch(error.stderr, /TypeError|Cannot read properties/);
        assert.doesNotMatch(error.stdout, /Full Stack ready/);
        return true;
      },
    );
  } finally {
    await new Promise((resolve) => blocker.close(resolve));
  }
});
