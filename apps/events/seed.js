export function seedEvents(db) {
  const insert = db.prepare(
    "INSERT OR IGNORE INTO events(slug,title,schedule,description,capacity) VALUES(?,?,?,?,?)",
  );
  for (const row of [
    [
      "build-day",
      "Build Something Good",
      "2026-12-05T10:00:00+05:00",
      "A hands-on campus workshop: turn an idea into your first working web application.",
      30,
    ],
    [
      "design-circle",
      "The Design Circle",
      "2026-12-12T14:00:00+05:00",
      "Explore accessible interfaces, share feedback and find a fresh perspective.",
      20,
    ],
    [
      "demo-night",
      "Student Demo Night",
      "2026-12-19T17:00:00+05:00",
      "Meet student builders, see their projects and celebrate what you have learned.",
      50,
    ],
  ])
    insert.run(...row);
}
