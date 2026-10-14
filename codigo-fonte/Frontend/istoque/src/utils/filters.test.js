import test from "node:test";
import assert from "node:assert/strict";
import {
  ALL,
  PERIODS,
  filterMovements,
  filterProducts,
  inPeriod,
  matchesSearch,
} from "./filters.js";

const products = [
  { id: "a", name: "Tomate", category: "Hortifruti", stock: 1, min: 2 },
  { id: "b", name: "Arroz", category: "Grãos", stock: 10, min: 2 },
  { id: "c", name: "Alface", category: "Hortifruti", stock: 9, min: 2 },
];

test("busca ignora maiúsculas e aceita parte do texto", () => {
  assert.equal(matchesSearch("Tomate italiano", "ITAL"), true);
  assert.equal(matchesSearch("Tomate", ""), true);
  assert.equal(matchesSearch("Tomate", "arroz"), false);
});

test("busca ignora acentos nos dois lados", () => {
  assert.equal(matchesSearch("Limão siciliano", "limao"), true);
  assert.equal(matchesSearch("Limao", "LIMÃO"), true);
  assert.equal(matchesSearch("Pão de hambúrguer", "hamburguer"), true);
  assert.equal(matchesSearch("Açúcar", "acucar"), true);
  assert.equal(matchesSearch("Arroz", "arróz branco"), false);
});

test("produtos combinam busca, categoria e estoque baixo", () => {
  const all = { search: "", category: ALL, onlyLow: false };
  assert.equal(filterProducts(products, all).length, 3);
  assert.deepEqual(
    filterProducts(products, { ...all, category: "Hortifruti" }).map(
      (p) => p.id,
    ),
    ["a", "c"],
  );
  assert.deepEqual(
    filterProducts(products, { ...all, onlyLow: true }).map((p) => p.id),
    ["a"],
  );
  assert.deepEqual(
    filterProducts(products, { ...all, search: "al" }).map((p) => p.id),
    ["c"],
  );
});

test("movimentações filtram por tipo e buscam no produto e no motivo", () => {
  const rows = [
    { type: "Entrada", product: "Arroz", reason: "compra semanal" },
    { type: "Perda", product: "Tomate", reason: "estragou" },
  ];
  assert.equal(filterMovements(rows, { search: "", type: ALL }).length, 2);
  assert.equal(filterMovements(rows, { search: "", type: "Perda" }).length, 1);
  assert.equal(
    filterMovements(rows, { search: "COMPRA", type: ALL })[0].product,
    "Arroz",
  );
});

test("período: todos, hoje, 7 dias e 30 dias", () => {
  const today = new Date(2026, 8, 26, 18, 0);
  const sameDay = new Date(2026, 8, 26, 9, 0).toISOString();
  const fiveDaysAgo = new Date(2026, 8, 21, 9, 0).toISOString();
  const twentyDaysAgo = new Date(2026, 8, 6, 9, 0).toISOString();
  const [everything, now, week, month] = PERIODS;
  assert.equal(inPeriod(twentyDaysAgo, everything, today), true);
  assert.equal(inPeriod(sameDay, now, today), true);
  assert.equal(inPeriod(fiveDaysAgo, now, today), false);
  assert.equal(inPeriod(fiveDaysAgo, week, today), true);
  assert.equal(inPeriod(twentyDaysAgo, week, today), false);
  assert.equal(inPeriod(twentyDaysAgo, month, today), true);
});
