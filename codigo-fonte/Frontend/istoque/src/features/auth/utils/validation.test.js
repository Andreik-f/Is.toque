import test from "node:test";
import assert from "node:assert/strict";
import { cnpjValido } from "./validation.js";

test("CNPJ com ou sem máscara é aceito, inclusive o alfanumérico", () => {
  assert.equal(cnpjValido("11444777000161"), true);
  assert.equal(cnpjValido("11.444.777/0001-61"), true);
  assert.equal(cnpjValido("12.ABC.345/01DE-35"), true);
  assert.equal(cnpjValido(" 11444777000161 "), true);
});

test("CNPJ com tamanho ou máscara errados é recusado", () => {
  assert.equal(cnpjValido("1144477700016"), false);
  assert.equal(cnpjValido("11.444.777/0001-6"), false);
  assert.equal(cnpjValido("11444777/000161"), false);
  assert.equal(cnpjValido("114447770001AB"), false);
});
