import test from "node:test";
import assert from "node:assert/strict";
import { mergeLoadedProducts } from "./product-merge.js";

const produto = (campos) => ({
  id: "1",
  name: "Arroz",
  min: 5,
  stock: 0,
  expiry: "",
  photo: "",
  art: "jar",
  ...campos,
});

test("mantém saldo, validade, foto e ilustração do produto que já estava na tela", () => {
  const naTela = [
    produto({ stock: 12, expiry: "2026-12-01", photo: "foto", art: "sack" }),
  ];
  const carregados = [produto({ name: "Arroz integral", min: 8 })];
  assert.deepEqual(mergeLoadedProducts(naTela, carregados), [
    produto({
      name: "Arroz integral",
      min: 8,
      stock: 12,
      expiry: "2026-12-01",
      photo: "foto",
      art: "sack",
    }),
  ]);
});

test("produto novo vindo da API entra como veio", () => {
  const carregados = [produto({ id: "2", name: "Feijão", stock: 3 })];
  assert.deepEqual(mergeLoadedProducts([produto()], carregados), carregados);
});

test("produto que sumiu da API sai da lista", () => {
  assert.deepEqual(mergeLoadedProducts([produto()], []), []);
});

test("mantém a ordem da lista carregada", () => {
  const naTela = [produto({ id: "1", stock: 9 }), produto({ id: "2" })];
  const carregados = [produto({ id: "2" }), produto({ id: "1" })];
  assert.deepEqual(
    mergeLoadedProducts(naTela, carregados).map((p) => [p.id, p.stock]),
    [
      ["2", 0],
      ["1", 9],
    ],
  );
});
