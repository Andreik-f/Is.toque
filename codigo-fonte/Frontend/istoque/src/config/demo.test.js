import test from "node:test";
import assert from "node:assert/strict";
import { DEMO_TODAY, demoNow } from "./demo.js";

test("movimentação nova cai no mesmo dia da demonstração, com o horário real", () => {
  const agora = new Date(2031, 0, 5, 21, 45, 10);
  const data = demoNow(agora);
  assert.equal(data.toLocaleDateString(), DEMO_TODAY.toLocaleDateString());
  assert.equal(data.getHours(), 21);
  assert.equal(data.getMinutes(), 45);
});
