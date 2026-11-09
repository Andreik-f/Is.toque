import test from "node:test";
import assert from "node:assert/strict";
import {
  mascararTelefone,
  mesmoTelefone,
  telefoneParaExibir,
  telefoneValido,
} from "./phone.js";

test("a máscara acompanha a digitação de um celular brasileiro", () => {
  assert.equal(mascararTelefone(""), "");
  assert.equal(mascararTelefone("3"), "(3");
  assert.equal(mascararTelefone("319"), "(31) 9");
  assert.equal(mascararTelefone("3198887"), "(31) 9888-7");
  assert.equal(mascararTelefone("31988887777"), "(31) 98888-7777");
});

test("fixo de 10 dígitos usa o hífen depois do quarto dígito", () => {
  assert.equal(mascararTelefone("3133334444"), "(31) 3333-4444");
});

test("número internacional fica só com o + e os dígitos", () => {
  assert.equal(mascararTelefone("+44 20 7183 8750"), "+442071838750");
});

test("mais de 11 dígitos sem + não é cortado nem formatado", () => {
  assert.equal(mascararTelefone("319888877778"), "319888877778");
});

test("aceita celular, fixo e internacional bem formados", () => {
  assert.equal(telefoneValido("(31) 98888-7777"), true);
  assert.equal(telefoneValido("3133334444"), true);
  assert.equal(telefoneValido("+442071838750"), true);
});

test("recusa tamanho errado, DDD com zero e celular sem o 9", () => {
  assert.equal(telefoneValido("123"), false);
  assert.equal(telefoneValido("abc"), false);
  assert.equal(telefoneValido("(31) 1234-5"), false);
  assert.equal(telefoneValido("01988887777"), false);
  assert.equal(telefoneValido("31888887777"), false);
  assert.equal(telefoneValido("+1234567"), false);
  assert.equal(telefoneValido("+1234567890123456"), false);
});

test("o E.164 brasileiro volta com a máscara; o internacional não muda", () => {
  assert.equal(telefoneParaExibir("+5531988887777"), "(31) 98888-7777");
  assert.equal(telefoneParaExibir("+442071838750"), "+442071838750");
  assert.equal(telefoneParaExibir(null), "");
});

test("o mesmo número em outro formato não conta como troca", () => {
  assert.equal(mesmoTelefone("(31) 98888-7777", "+5531988887777"), true);
  assert.equal(mesmoTelefone("31988887777", "(31) 98888-7777"), true);
  assert.equal(mesmoTelefone("", null), true);
  assert.equal(mesmoTelefone("31988887777", "31988887778"), false);
  assert.equal(mesmoTelefone("31988887777", ""), false);
});
