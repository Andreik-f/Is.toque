import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { createCountdown } from "./countdown.js";

const comRelogioFalso = (corpo) => () => {
  mock.timers.enable({ apis: ["setInterval", "Date"] });
  try {
    corpo(createCountdown());
  } finally {
    mock.timers.reset();
  }
};

test(
  "a contagem de 60 segundos desce de um em um, termina em zero e para de avisar",
  comRelogioFalso((countdown) => {
    assert.equal(countdown.getRemaining(), 0);
    let avisos = 0;
    countdown.subscribe(() => avisos++);
    countdown.start(60);
    assert.equal(countdown.getRemaining(), 60);
    mock.timers.tick(1000);
    assert.equal(countdown.getRemaining(), 59);
    mock.timers.tick(59000);
    assert.equal(countdown.getRemaining(), 0);
    const total = avisos;
    mock.timers.tick(5000);
    assert.equal(avisos, total);
  }),
);

test(
  "reiniciar recomeça a contagem do zero",
  comRelogioFalso((countdown) => {
    countdown.subscribe(() => {});
    countdown.start(60);
    mock.timers.tick(30000);
    assert.equal(countdown.getRemaining(), 30);
    countdown.start(60);
    assert.equal(countdown.getRemaining(), 60);
  }),
);

test(
  "sem ninguém escutando o timer desliga, e o que falta continua certo pelo relógio",
  comRelogioFalso((countdown) => {
    countdown.subscribe(() => {})();
    countdown.start(10);
    mock.timers.tick(3000);
    assert.equal(countdown.getRemaining(), 7);
  }),
);
