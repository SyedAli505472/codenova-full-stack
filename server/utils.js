export const fail = (status, message) =>
  Object.assign(new Error(message), { status });
export function id(value) {
  if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value)))
    throw fail(400, "ID must be a positive integer.");
  return Number(value);
}
export function body(req) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
    throw fail(400, "A JSON object is required.");
  return req.body;
}
export function text(value, label, max = 120) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max)
    throw fail(400, `${label} is required (1–${max} characters).`);
  return value.trim();
}
export function found(row) {
  if (!row) throw fail(404, "Record not found.");
  return row;
}
