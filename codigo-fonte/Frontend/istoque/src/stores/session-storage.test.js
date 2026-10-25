import test from "node:test";
import assert from "node:assert/strict";
import {
  STORAGE_KEY,
  isExpired,
  readStoredSession,
  writeStoredSession,
} from "./session-storage.js";

const NOW = Date.parse("2026-10-25T12:00:00-03:00");
const session = (extra = {}) => ({
  id: 1,
  empresaId: 7,
  token: "tok.en",
  expiraEm: "2026-10-25T18:00:00-03:00",
  ...extra,
});

const fakeStorage = (initial) => {
  const data = new Map(initial === undefined ? [] : [[STORAGE_KEY, initial]]);
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: (key) => data.delete(key),
  };
};

test("sessão com token dentro da validade é mantida", () => {
  const storage = fakeStorage(JSON.stringify(session()));
  assert.deepEqual(readStoredSession(storage, NOW), {
    session: session(),
    expired: false,
  });
});

test("token vencido não vira sessão e sinaliza a expiração", () => {
  const storage = fakeStorage(
    JSON.stringify(session({ expiraEm: "2026-10-25T11:59:59-03:00" })),
  );
  assert.deepEqual(readStoredSession(storage, NOW), {
    session: null,
    expired: true,
  });
});

test("o fuso do expiraEm entra na comparação", () => {
  assert.equal(isExpired("2026-10-25T14:00:00-03:00", NOW), false);
  assert.equal(isExpired("2026-10-25T11:00:00-03:00", NOW), true);
  assert.equal(isExpired("2026-10-25T14:00:00Z", NOW), true);
});

test("expiraEm ausente ou ilegível conta como expirado", () => {
  assert.equal(isExpired(undefined, NOW), true);
  assert.equal(isExpired("amanhã", NOW), true);
  assert.equal(isExpired(NOW + 1000, NOW), false);
});

test("sessão antiga, sem token, pede novo login", () => {
  const storage = fakeStorage(JSON.stringify({ id: 1, empresaId: 7 }));
  assert.deepEqual(readStoredSession(storage, NOW), {
    session: null,
    expired: true,
  });
});

test("sem nada guardado ou com lixo não há sessão nem aviso", () => {
  assert.deepEqual(readStoredSession(fakeStorage(), NOW), {
    session: null,
    expired: false,
  });
  assert.deepEqual(readStoredSession(fakeStorage("{quebrado"), NOW), {
    session: null,
    expired: false,
  });
});

test("gravar guarda a sessão e gravar null apaga", () => {
  const storage = fakeStorage();
  writeStoredSession(storage, session());
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), session());
  writeStoredSession(storage, null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test("armazenamento que lança erro não quebra", () => {
  const broken = {
    getItem: () => {
      throw new Error("bloqueado");
    },
    setItem: () => {
      throw new Error("bloqueado");
    },
    removeItem: () => {
      throw new Error("bloqueado");
    },
  };
  assert.doesNotThrow(() => writeStoredSession(broken, session()));
  assert.deepEqual(readStoredSession(broken, NOW), {
    session: null,
    expired: false,
  });
});
