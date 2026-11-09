import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../../../lib/api-client.js";
import {
  CODIGO_INVALIDO,
  companyToApi,
  createCompanyApi,
  erroDoCodigo,
  pedidoBloqueado,
  telefoneConfirmado,
} from "./company-api.js";

const empresa = {
  razaoSocial: "Sabor Caseiro LTDA",
  nomeFantasia: "Sabor Caseiro",
  cnpj: "12.345.678/0001-90",
  email: "contato@saborcaseiro.com",
  telefone: "+5531988887777",
  telefoneVerificadoEm: null,
  diasAlertaValidade: 5,
};

// Cliente de verdade com um fetch falso que registra as chamadas.
function apiFalsa(respostas = {}) {
  const chamadas = [];
  const fetchFn = async (url, { method, body }) => {
    chamadas.push({ rota: `${method} ${url}`, body });
    const { status = 204, body: corpo } = respostas[`${method} ${url}`] ?? {};
    return {
      ok: status < 400,
      status,
      text: async () => (corpo ? JSON.stringify(corpo) : ""),
    };
  };
  return { api: createApiClient({ baseUrl: "/api", fetchFn }), chamadas };
}

test("confirmado é ter a data de confirmação, qualquer que seja o formato", () => {
  assert.equal(telefoneConfirmado(empresa), false);
  assert.equal(
    telefoneConfirmado({
      ...empresa,
      telefoneVerificadoEm: "2026-11-03 10:15:00",
    }),
    true,
  );
});

test("trocar o telefone reenvia a empresa inteira, e telefone em branco apaga o número", () => {
  const esperado = { ...empresa, telefone: "(31) 97777-6666" };
  delete esperado.telefoneVerificadoEm;
  assert.deepEqual(companyToApi(empresa, " (31) 97777-6666 "), esperado);
  const vazia = companyToApi(
    { ...empresa, nomeFantasia: null, email: null },
    " ",
  );
  assert.deepEqual(
    [vazia.nomeFantasia, vazia.email, vazia.telefone],
    [null, null, null],
  );
});

test("salvar o telefone lê a empresa e depois grava, nessa ordem", async () => {
  const { api, chamadas } = apiFalsa({
    "GET /api/empresas/minha": { status: 200, body: empresa },
    "PUT /api/empresas/minha": { status: 200, body: empresa },
  });
  await createCompanyApi(api).saveCompanyPhone("31977776666");
  assert.deepEqual(
    chamadas.map((c) => c.rota),
    ["GET /api/empresas/minha", "PUT /api/empresas/minha"],
  );
  assert.equal(JSON.parse(chamadas[1].body).telefone, "31977776666");
  assert.equal(JSON.parse(chamadas[1].body).cnpj, empresa.cnpj);
});

test("enviar e confirmar o código usam as rotas do telefone", async () => {
  const { api, chamadas } = apiFalsa();
  const company = createCompanyApi(api);
  await company.sendPhoneCode();
  await company.confirmPhoneCode("123456");
  assert.deepEqual(chamadas, [
    { rota: "POST /api/empresas/minha/telefone/codigo", body: undefined },
    {
      rota: "POST /api/empresas/minha/telefone/confirmar",
      body: '{"codigo":"123456"}',
    },
  ]);
});

test("código inválido mostra a mensagem genérica, e o 429 vira bloqueio", async () => {
  const mensagem = "Muitos pedidos de código. Aguarde para pedir um novo";
  const { api } = apiFalsa({
    "POST /api/empresas/minha/telefone/confirmar": {
      status: 400,
      body: { message: "qualquer texto do servidor" },
    },
    "POST /api/empresas/minha/telefone/codigo": {
      status: 429,
      body: { message: mensagem },
    },
  });
  const company = createCompanyApi(api);
  const recusado = await company.confirmPhoneCode("000000").catch((e) => e);
  const bloqueado = await company.sendPhoneCode().catch((e) => e);
  assert.equal(erroDoCodigo(recusado), CODIGO_INVALIDO);
  assert.equal(pedidoBloqueado(bloqueado), true);
  assert.equal(erroDoCodigo(bloqueado), mensagem);
});
