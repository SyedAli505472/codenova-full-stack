import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { fail, body } from "./utils.js";
export function registerAuth(app, options = {}) {
  const username = options.username ?? process.env.ADMIN_USERNAME,
    password = options.password ?? process.env.ADMIN_PASSWORD;
  const configured =
    typeof username === "string" &&
    typeof password === "string" &&
    password.length >= 12 &&
    !password.startsWith("REPLACE_");
  const salt = randomBytes(16),
    expected = configured ? scryptSync(password, salt, 32) : null,
    sessions = new Map(),
    attempts = new Map();
  const token = (req) =>
    (req.headers.cookie || "")
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("fs_session="))
      ?.slice(11);
  const sameOrigin = (req, res, next) => {
    if (
      req.headers.origin &&
      req.headers.origin !== `${req.protocol}://${req.get("host")}`
    )
      throw fail(403, "Cross-origin admin requests are not allowed.");
    next();
  };
  const guard = (req, res, next) => {
    const expiry = sessions.get(token(req));
    if (!expiry || expiry < Date.now()) {
      sessions.delete(token(req));
      throw fail(401, "Admin sign-in required.");
    }
    next();
  };
  app.post("/api/admin/login", sameOrigin, (req, res) => {
    if (!configured)
      throw fail(
        503,
        "Set ADMIN_USERNAME and a password of at least 12 characters in .env, then restart the server.",
      );
    const b = body(req),
      now = Date.now(),
      key = req.ip;
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    const attempt = attempts.get(key) || {
      count: 0,
      until: now + 15 * 60 * 1000,
    };
    if (attempt.count >= 5)
      throw fail(429, "Too many sign-in attempts. Try again in 15 minutes.");
    attempt.count++;
    attempts.set(key, attempt);
    const provided =
      typeof b.password === "string" && b.password.length <= 256
        ? b.password
        : "";
    if (
      !timingSafeEqual(scryptSync(provided, salt, 32), expected) ||
      b.username !== username
    )
      throw fail(401, "Incorrect username or password.");
    attempts.delete(key);
    for (const [k, v] of sessions) if (v < now) sessions.delete(k);
    sessions.delete(token(req));
    const session = randomBytes(32).toString("hex");
    sessions.set(session, now + 2 * 60 * 60 * 1000);
    res.cookie("fs_session", session, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.COOKIE_SECURE === "true",
      maxAge: 2 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ data: { authenticated: true } });
  });
  app.get("/api/admin/session", guard, (req, res) =>
    res.json({ data: { authenticated: true } }),
  );
  app.post("/api/admin/logout", sameOrigin, (req, res) => {
    sessions.delete(token(req));
    res.clearCookie("fs_session", { path: "/", sameSite: "strict" });
    res.json({ data: { authenticated: false } });
  });
  return [sameOrigin, guard];
}
