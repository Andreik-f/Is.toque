import test from "node:test";
import assert from "node:assert/strict";
import { temPermissao } from "./permissions.js";

test("só tem a permissão quem a recebeu no login", () => {
  const sessao = { permissoes: ["empresa.configurar", "relatorios.ver"] };
  assert.equal(temPermissao(sessao, "empresa.configurar"), true);
  assert.equal(temPermissao(sessao, "usuarios.gerenciar"), false);
});

test("sessão sem lista de permissões, ou sem sessão, não tem nenhuma", () => {
  assert.equal(temPermissao({}, "empresa.configurar"), false);
  assert.equal(temPermissao(null, "empresa.configurar"), false);
});
