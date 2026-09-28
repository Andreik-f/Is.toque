import test from "node:test";
import assert from "node:assert/strict";
import {
  produce,
  capacity,
  moveStock,
  isLow,
  controlsExpiry,
  registerLotExpiry,
  purchaseSuggestion,
  stockCap,
} from "./inventory.js";
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
test("validade vem da entrada e o produto mostra o lote que vence primeiro", () => {
  const produto = { id: "x", expiry: "2026-10-10" };
  assert.equal(registerLotExpiry(produto, "2026-10-01").expiry, "2026-10-01");
  assert.equal(registerLotExpiry(produto, "2026-12-01").expiry, "2026-10-10");
  assert.equal(registerLotExpiry({ id: "y" }, "2026-11-01").expiry, "2026-11-01");
  assert.equal(registerLotExpiry(produto, ""), produto);
});
test("controle de validade é do produto; exemplos com data já controlam", () => {
  assert.equal(controlsExpiry({ controlsExpiry: false, expiry: "2026-10-01" }), false);
  assert.equal(controlsExpiry({ controlsExpiry: true }), true);
  assert.equal(controlsExpiry({ expiry: "2026-10-01" }), true);
  assert.equal(controlsExpiry({}), false);
});
test("mínimo é inclusivo e ajuste aceita saldo zero", () => {
  assert.equal(isLow({ ...productsSeed[0], stock: 2 }), true);
  assert.equal(moveStock(productsSeed[0], "Ajuste", 0).stock, 0);
  assert.throws(() => moveStock(productsSeed[2], "Entrada", 1.5));
});

test("sugestão de compra completa até o máximo ou, sem ele, até o mínimo", () => {
  assert.equal(purchaseSuggestion({ stock: 0.6, min: 2, max: 8 }), 7.4);
  assert.equal(purchaseSuggestion({ stock: 0.6, min: 2, max: null }), 1.4);
  assert.equal(purchaseSuggestion({ stock: 3, min: 2, max: null }), 0);
});

test("barra de saldo usa o máximo ou, sem ele, o dobro do mínimo", () => {
  assert.equal(stockCap({ stock: 1, min: 2, max: 8 }), 8);
  assert.equal(stockCap({ stock: 1, min: 2, max: null }), 4);
  assert.equal(stockCap({ stock: 0, min: 0, max: null }), 1);
});
