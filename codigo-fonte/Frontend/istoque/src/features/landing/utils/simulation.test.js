import test from "node:test";
import assert from "node:assert/strict";
import {
  FRAMES,
  capacityLabel,
  formatAmount,
  frameState,
} from "./simulation.js";

const expected = [
  ["Novo dia", 12, "Tomate italiano"],
  ["Produção", 7, "Tomate italiano"],
  ["Alerta", 7, "Tomate italiano"],
  ["Entrada", 25, "Carne bovina moída"],
  ["Produção", 15, "Carne bovina moída"],
  ["Perda", 10, "Alface americana"],
  ["Entrada", 15, "Carne bovina moída"],
];

test("cada quadro do dia tem a capacidade e o limitante esperados", () => {
  assert.equal(FRAMES.length, 7);
  expected.forEach(([type, capacity, limiting], step) => {
    const state = frameState(step);
    assert.equal(state.current.type, type, `quadro ${step}`);
    assert.equal(state.capacity, capacity, `quadro ${step}`);
    assert.equal(state.limiting, limiting, `quadro ${step}`);
    const marked = state.ingredients.filter((i) => i.limiting);
    assert.deepEqual(
      marked.map((i) => i.name),
      [limiting],
    );
  });
});

test("no empate, o limitante é o primeiro ingrediente da receita", () => {
  // quadro 4: pão rende 21, carne 15, queijo 15, tomate 37, alface 15
  const state = frameState(4);
  assert.deepEqual(
    state.ingredients.map((i) => i.yieldsText),
    ["rende 21", "rende 15", "rende 15", "rende 37", "rende 15"],
  );
  assert.equal(state.limiting, "Carne bovina moída");
});

test("o ciclo volta ao primeiro quadro depois do sétimo", () => {
  assert.equal(frameState(7).index, 0);
  assert.equal(frameState(15).index, 1);
});

test("o histórico mostra os três quadros anteriores, em ciclo", () => {
  const history = frameState(1).history.map((m) => m.type + ": " + m.title);
  assert.deepEqual(history, [
    "Novo dia: Contagem da manhã conferida",
    "Entrada: Alface americana",
    "Perda: Alface americana",
  ]);
  assert.deepEqual(frameState(0).history[0].color, "#277957");
});

test("quantidades em unidade ou em kg, no formato brasileiro", () => {
  assert.equal(formatAmount(36, "un"), "36 un");
  assert.equal(formatAmount(4500, "g"), "4,5 kg");
  assert.equal(formatAmount(350, "g"), "0,35 kg");
  assert.equal(formatAmount(1200, "g"), "1,2 kg");
  assert.equal(formatAmount(150, "g"), "0,15 kg");
});

test("rótulo da capacidade no singular só para uma porção", () => {
  assert.equal(capacityLabel(1), "porção disponível");
  assert.equal(capacityLabel(0), "porções disponíveis");
  assert.equal(capacityLabel(12), "porções disponíveis");
});

test("a barra do saldo é proporcional ao máximo e não passa de 100%", () => {
  const [pao, , , tomate] = frameState(0).ingredients;
  assert.equal(pao.fill, 36 / 40);
  assert.equal(tomate.fill, 600 / 2500);
  assert.ok(frameState(3).ingredients.every((i) => i.fill <= 1));
});
