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
  assert.deepEqual(sessionFromSignup({ empresa, usuario }), {
    id: 3,
    nome: "Ana Souza",
    email: "ana@exemplo.com",
    perfil: "Administrador",
    empresaId: 7,
    nomeEmpresa: "Cozinha da Casa LTDA",
  });
  assert.equal(
    sessionFromSignup({ empresa: { ...empresa, nomeFantasia: "Casa" }, usuario }).nomeEmpresa,
    "Casa",
  );
});
