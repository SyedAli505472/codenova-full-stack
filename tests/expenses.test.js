import { test } from "node:test";
import assert from "node:assert/strict";
import { harness } from "./helper.js";
test("expenses validation, decimals, negative balance, ordering and deletion", async () => {
  const h = await harness("expenses");
  const valid = {
    type: "income",
    description: "Salary",
    category: "Salary",
    amount: "100.10",
    transaction_date: "2026-11-01",
  };
  try {
    for (const patch of [
      { amount: 0 },
      { amount: -1 },
      { amount: "1.234" },
      { amount: "Infinity" },
      { amount: "NaN" },
      { amount: "1\n" },
      { amount: null },
      { amount: 1000000.01 },
      { type: "gift" },
      { type: "__proto__" },
      { category: "Food" },
      { transaction_date: "2026-02-30" },
      { transaction_date: "2026-2-01" },
      { description: " " },
    ])
      assert.equal(
        (await h.req("/transactions", "POST", { ...valid, ...patch })).status,
        400,
        JSON.stringify(patch),
      );
    for (const key of Object.keys(valid)) {
      const b = { ...valid };
      delete b[key];
      assert.equal((await h.req("/transactions", "POST", b)).status, 400);
    }
    const a = await h.req("/transactions", "POST", valid);
    assert.equal(a.status, 201);
    const b = await h.req("/transactions", "POST", {
      ...valid,
      type: "expense",
      category: "Food",
      amount: "100.20",
      transaction_date: "2026-11-02",
    });
    assert.deepEqual((await h.req("/summary")).body.data, {
      income_minor: 10010,
      expenses_minor: 10020,
      balance_minor: -10,
      currency: "PKR",
    });
    assert.equal(
      (await h.req("/transactions")).body.data[0].id,
      b.body.data.id,
    );
    assert.equal(
      (await h.req("/transactions/" + b.body.data.id, "DELETE")).status,
      200,
    );
    assert.equal((await h.req("/summary")).body.data.balance_minor, 10010);
    assert.equal(
      (await h.req("/transactions/" + b.body.data.id, "DELETE")).status,
      404,
    );
  } finally {
    await h.close();
  }
});
