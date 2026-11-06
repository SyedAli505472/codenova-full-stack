import { openDatabase } from "./db.js";
import { createApp } from "./app.js";
import { createServer } from "node:http";
const db = openDatabase();
const port = Number(process.env.PORT || 3100);
const server = createServer(createApp(db));
// Log readiness only after the socket binds. Express 5 can invoke its listen
// callback on failure too, when server.address() is still null.
server.once("listening", () => {
  console.log(`Full Stack ready: http://127.0.0.1:${server.address().port}`);
});
server.once("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Cannot start: port ${port} is already in use. Open http://127.0.0.1:${port} if Full Stack is already running, or set a different PORT in .env and try again.`,
    );
  } else {
    console.error(`Cannot start the local server (${error.code || "unknown error"}). Check the PORT setting and try again.`);
  }
  db.close();
  process.exitCode = 1;
});
server.listen(port, "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );
