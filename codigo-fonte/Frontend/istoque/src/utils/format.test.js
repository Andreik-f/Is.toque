import test from "node:test";
import assert from "node:assert/strict";
import { initials, plural } from "./format.js";

test("iniciais usam as duas primeiras palavras, em maiúsculas", () => {
  assert.equal(initials("David Rocha"), "DR");
  assert.equal(initials("ana  maria  souza"), "AM");
  assert.equal(initials("Cozinha"), "C");
});

test("plural usa o singular só para 1", () => {
  assert.equal(plural(1, "porção", "porções"), "1 porção");
  assert.equal(plural(0, "porção", "porções"), "0 porções");
  assert.equal(plural(12, "porção", "porções"), "12 porções");
});
