export const categories = {
  income: ["Salary", "Freelance", "Other Income"],
  expense: [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Health",
    "Education",
    "Other Expense",
  ],
};
export function validate(body) {
  const errors = {};
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { body: "A JSON object is required." };
  if (!Object.hasOwn(categories, body.type))
    errors.type = "Choose Income or Expense.";
  if (
    !Object.hasOwn(categories, body.type) ||
    !categories[body.type].includes(body.category)
  )
    errors.category = "Choose a category matching the transaction type.";
  if (
    typeof body.description !== "string" ||
    !body.description.trim() ||
    body.description.trim().length > 120
  )
    errors.description = "Enter a description between 1 and 120 characters.";
  // Decimal strings preserve precision; numeric JSON amounts are also accepted.
  const amount =
    typeof body.amount === "string" || typeof body.amount === "number"
      ? String(body.amount)
      : "";
  if (
    amount.trim() !== amount ||
    !/^\d+(\.\d{1,2})?$/.test(amount) ||
    !Number.isFinite(Number(amount)) ||
    Number(amount) <= 0 ||
    Number(amount) > 1000000
  )
    errors.amount =
      "Enter an amount from PKR 0.01 to 1,000,000 with up to two decimals.";
  const date = body.transaction_date;
  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date < "0001-01-01" ||
    !Number.isFinite(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    errors.transaction_date = "Enter a valid date in YYYY-MM-DD format.";
  return errors;
}
export function minorUnits(amount) {
  const [whole, fraction = ""] = String(amount).split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}
