import test from "node:test";
import assert from "node:assert/strict";
import { cnpjValido, fieldError } from "./validation.js";

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

const ctx = { signup: true, senha: "", typeMismatch: false };

test("campo vazio devolve a mensagem de obrigatório do campo", () => {
  assert.equal(
    fieldError({ name: "email", type: "email" }, "", ctx),
    "Informe seu e-mail.",
  );
  assert.equal(
    fieldError({ name: "nome" }, "   ", ctx),
    "Informe o nome do responsável.",
  );
});

test("cada regra de campo devolve a sua mensagem", () => {
  assert.match(fieldError({ name: "cnpj" }, "123", ctx), /14 caracteres/);
  assert.equal(fieldError({ name: "cnpj" }, "11444777000161", ctx), "");
  assert.equal(
    fieldError({ name: "email", type: "email" }, "x", {
      ...ctx,
      typeMismatch: true,
    }),
    "Digite um e-mail válido.",
  );
  assert.match(fieldError({ name: "senha" }, "1234567", ctx), /mínimo 8/);
  assert.equal(
    fieldError({ name: "senha" }, "1234567", { ...ctx, signup: false }),
    "",
  );
  assert.equal(
    fieldError({ name: "confirmacao" }, "abc", { ...ctx, senha: "abd" }),
    "As senhas precisam ser iguais.",
  );
  assert.equal(
    fieldError({ name: "confirmacao" }, "abc", { ...ctx, senha: "abc" }),
    "",
  );
});

test("o telefone da empresa é opcional: vazio passa, e preenchido precisa ser válido", () => {
  const telefone = { name: "telefone", type: "tel" };
  assert.equal(fieldError(telefone, "", ctx), "");
  assert.equal(fieldError(telefone, "   ", ctx), "");
  assert.equal(fieldError(telefone, "(31) 98888-7777", ctx), "");
  assert.equal(fieldError(telefone, "+442071838750", ctx), "");
  assert.equal(
    fieldError(telefone, "(31) 1234-5", ctx),
    "O telefone informado é inválido.",
  );
  assert.equal(
    fieldError(telefone, "abc", ctx),
    "O telefone informado é inválido.",
  );
});
