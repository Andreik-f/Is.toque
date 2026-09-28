import test from "node:test";
import assert from "node:assert/strict";
import { produce, capacity, moveStock, isLow } from "./inventory.js";
import { productsSeed, recipesSeed } from "../testing/mocks/seed-data.js";
test("produção baixa ingredientes, recalcula receitas e preserva origem", () => {
  const before = JSON.stringify(productsSeed);
  assert.equal(capacity(recipesSeed[0], productsSeed), 12);
  const next = produce(recipesSeed[0], 5, productsSeed);
  assert.equal(next.find((p) => p.id === "tomate").stock, 0.35);
  assert.equal(capacity(recipesSeed[0], next), 7);
  assert.equal(capacity(recipesSeed[2], next), 4);
  assert.equal(JSON.stringify(productsSeed), before);
});
test("limites da produção e saída impedem saldo negativo", () => {
  assert.throws(() => produce(recipesSeed[0], 13, productsSeed));
  assert.throws(() => produce(recipesSeed[0], 1.5, productsSeed));
  assert.throws(() => moveStock(productsSeed[0], "Saída", 1));
  assert.equal(
    produce(recipesSeed[0], 12, productsSeed).find((p) => p.id === "tomate")
      .stock,
    0,
  );
});
test("mínimo é inclusivo e ajuste aceita saldo zero", () => {
  assert.equal(isLow({ ...productsSeed[0], stock: 2 }), true);
  assert.equal(moveStock(productsSeed[0], "Ajuste", 0).stock, 0);
  assert.throws(() => moveStock(productsSeed[2], "Entrada", 1.5));
});
