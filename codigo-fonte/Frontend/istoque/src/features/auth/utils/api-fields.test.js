import test from "node:test";
import assert from "node:assert/strict";
import { formFieldErrors, sessionFromSignup, signupToApi } from "./api-fields.js";

test("cadastro envia os campos com os nomes da API, sem a confirmação", () => {
  assert.deepEqual(
    signupToApi({
      razao_social: " Cozinha da Casa LTDA ",
      cnpj: "12.345.678/0001-95",
      nome: "Ana Souza ",
      email: " ana@exemplo.com",
      senha: "SenhaForte123",
      confirmacao: "SenhaForte123",
    }),
    {
      razaoSocial: "Cozinha da Casa LTDA",
      cnpj: "12.345.678/0001-95",
      nome: "Ana Souza",
      email: "ana@exemplo.com",
      senha: "SenhaForte123",
    },
  );
});

test("erros de campo da API usam os nomes do formulário", () => {
  assert.deepEqual(
    formFieldErrors({ razaoSocial: "Obrigatória", cnpj: "CNPJ inválido" }),
    { razao_social: "Obrigatória", cnpj: "CNPJ inválido" },
  );
  assert.deepEqual(formFieldErrors(null), {});
});

test("a sessão do cadastro tem o mesmo formato da resposta do login", () => {
  const empresa = { id: 7, razaoSocial: "Cozinha da Casa LTDA", nomeFantasia: null };
  const usuario = { id: 3, nome: "Ana Souza", email: "ana@exemplo.com", perfil: "Administrador", empresaId: 7 };
  const acesso = { token: "abc.def.ghi", expiraEm: "2026-10-26T10:00:00-03:00" };
  assert.deepEqual(sessionFromSignup({ empresa, usuario, ...acesso }), {
    id: 3,
    nome: "Ana Souza",
    email: "ana@exemplo.com",
    perfil: "Administrador",
    empresaId: 7,
    nomeEmpresa: "Cozinha da Casa LTDA",
    ...acesso,
  });
  assert.equal(
    sessionFromSignup({ empresa: { ...empresa, nomeFantasia: "Casa" }, usuario }).nomeEmpresa,
    "Casa",
  );
});

test("o cadastro envia o telefone só quando foi preenchido", () => {
  const base = {
    razao_social: "Cozinha da Casa LTDA",
    cnpj: "12.345.678/0001-95",
    nome: "Ana Souza",
    email: "ana@exemplo.com",
    senha: "SenhaForte123",
  };
  assert.equal("telefone" in signupToApi({ ...base, telefone: "" }), false);
  assert.equal("telefone" in signupToApi({ ...base, telefone: "  " }), false);
  assert.equal(
    signupToApi({ ...base, telefone: " (31) 98888-7777 " }).telefone,
    "(31) 98888-7777",
  );
});

test("a sessão do cadastro leva as permissões quando a API as devolve", () => {
  const empresa = { id: 7, razaoSocial: "Casa LTDA", nomeFantasia: null };
  const usuario = {
    id: 3,
    nome: "Ana",
    email: "a@b.com",
    perfil: "Administrador",
  };
  const permissoes = ["empresa.configurar"];
  assert.deepEqual(
    sessionFromSignup({ empresa, usuario, permissoes }).permissoes,
    permissoes,
  );
  assert.equal("permissoes" in sessionFromSignup({ empresa, usuario }), false);
});
