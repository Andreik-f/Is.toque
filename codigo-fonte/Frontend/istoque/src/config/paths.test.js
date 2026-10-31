import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_ROUTE,
  isNavActive,
  isUnknownPath,
  NOT_FOUND_ROUTE,
  parseHash,
  routeTitle,
  showsLanding,
} from "./paths.js";

test("a URL leva a rota e, nas telas de detalhe, o id do item", () => {
  assert.deepEqual(parseHash("#produto/12"), { route: "produto", id: "12" });
  assert.deepEqual(parseHash("#receita/receita-1%2F2"), {
    route: "receita",
    id: "receita-1/2",
  });
  assert.deepEqual(parseHash("#estoque"), { route: "estoque", id: null });
  assert.deepEqual(parseHash(""), { route: DEFAULT_ROUTE, id: null });
});

test("sem hash, a página inicial abre só para quem não tem sessão", () => {
  assert.equal(showsLanding("", false), true);
  assert.equal(showsLanding("#", false), true);
  assert.equal(showsLanding("", true), false);
  assert.equal(showsLanding("#inicio", false), true);
  assert.equal(showsLanding("#inicio", true), true);
  assert.equal(showsLanding("#dashboard", false), false);
  assert.equal(showsLanding("#login", false), false);
});

test("produto e receita deixam marcado o item do menu de onde vieram", () => {
  assert.equal(isNavActive("estoque", "produto"), true);
  assert.equal(isNavActive("receitas", "receita"), true);
  assert.equal(isNavActive("estoque", "estoque"), true);
  assert.equal(isNavActive("receitas", "produto"), false);
});

test("endereço sem tela correspondente aparece como página não encontrada", () => {
  assert.equal(routeTitle(NOT_FOUND_ROUTE), "Página não encontrada");
  assert.equal(isNavActive("dashboard", NOT_FOUND_ROUTE), false);
});

test("só a raiz é um caminho válido; qualquer outro vira página não encontrada", () => {
  assert.equal(isUnknownPath("/"), false);
  assert.equal(isUnknownPath("/index.html"), false);
  assert.equal(isUnknownPath("/abc"), true);
  assert.equal(isUnknownPath("/estoque/12"), true);
});
