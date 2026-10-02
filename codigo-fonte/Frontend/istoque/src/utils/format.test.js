import test from "node:test";
import assert from "node:assert/strict";
import { plural } from "./format.js";

test("plural usa o singular só para 1", () => {
  assert.equal(plural(1, "porção", "porções"), "1 porção");
  assert.equal(plural(0, "porção", "porções"), "0 porções");
  assert.equal(plural(12, "porção", "porções"), "12 porções");
});
