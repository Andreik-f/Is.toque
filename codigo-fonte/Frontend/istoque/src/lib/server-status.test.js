import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { healthUrl, waitForServer } from "./server-status.js";

test("o health fica na base da API, sem o /api do final", () => {
  const health = "https://is-toque-prod.onrender.com/actuator/health";
  assert.equal(healthUrl("https://is-toque-prod.onrender.com/api"), health);
  assert.equal(healthUrl("https://is-toque-prod.onrender.com/api/"), health);
  assert.equal(healthUrl("/api"), null);
});

test("tenta de novo (erro de rede e 503) até a API responder 200", async () => {
  const answers = [
    () => {
      throw new TypeError("Failed to fetch");
    },
    () => ({ ok: false }),
    () => ({ ok: true }),
  ];
  const fetchMock = mock.method(globalThis, "fetch", async () => answers.shift()());
  assert.equal(await waitForServer("x", { gapMs: 0 }), true);
  assert.equal(fetchMock.mock.callCount(), 3);
  fetchMock.mock.restore();
});

test("desiste depois do número máximo de tentativas", async () => {
  const fetchMock = mock.method(globalThis, "fetch", async () => ({ ok: false }));
  assert.equal(await waitForServer("x", { tries: 4, gapMs: 0 }), false);
  assert.equal(fetchMock.mock.callCount(), 4);
  fetchMock.mock.restore();
});
