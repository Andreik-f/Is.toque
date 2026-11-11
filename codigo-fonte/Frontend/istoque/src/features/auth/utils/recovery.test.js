import test from "node:test";
import assert from "node:assert/strict";
import { createApiClient } from "../../../lib/api-client.js";
import { CODIGO_INVALIDO, pedidoBloqueado } from "../../../utils/sms-code.js";
import {
  CAMPOS_DA_TROCA,
  CAMPOS_DO_PEDIDO,
  createRecoveryApi,
  recoveryErrors,
  resetErrors,
} from "./recovery.js";

const PEDIDO = "POST /api/auth/recuperar-senha";
const TROCA = "POST /api/auth/recuperar-senha/confirmar";

// Cliente de verdade com um fetch falso que registra as chamadas.
function apiFalsa(respostas = {}) {
  const chamadas = [];
  const fetchFn = async (url, { method, body }) => {
    chamadas.push({ rota: `${method} ${url}`, body: JSON.parse(body) });
    const { status = 204, body: corpo } = respostas[`${method} ${url}`] ?? {};
    return {
      ok: status < 400,
      status,
      text: async () => (corpo ? JSON.stringify(corpo) : ""),
    };
  };
  return {
    recovery: createRecoveryApi(createApiClient({ baseUrl: "/api", fetchFn })),
    chamadas,
  };
}

const troca = {
  email: "ana@saborcaseiro.com",
  codigo: "123456",
  novaSenha: "NovaSenha-1",
  confirmacao: "NovaSenha-1",
};

test("o pedido de código envia só o e-mail, sem os espaços das pontas", async () => {
  const { recovery, chamadas } = apiFalsa();
  await recovery.requestRecoveryCode("  ana@saborcaseiro.com ");
  assert.deepEqual(chamadas, [
    { rota: PEDIDO, body: { email: "ana@saborcaseiro.com" } },
  ]);
});

test("a troca envia e-mail, código e nova senha, sem a confirmação", async () => {
  const { recovery, chamadas } = apiFalsa();
  await recovery.resetPassword(troca);
  assert.deepEqual(chamadas, [
    {
      rota: TROCA,
      body: {
        email: "ana@saborcaseiro.com",
        codigo: "123456",
        novaSenha: "NovaSenha-1",
      },
    },
  ]);
});

test("o passo do pedido só aceita um e-mail preenchido e bem formado", () => {
  assert.deepEqual(recoveryErrors(CAMPOS_DO_PEDIDO, { email: "" }), {
    email: "Informe seu e-mail.",
  });
  assert.deepEqual(
    recoveryErrors(CAMPOS_DO_PEDIDO, { email: "ana" }, { typeMismatch: true }),
    { email: "Digite um e-mail válido." },
  );
  assert.deepEqual(recoveryErrors(CAMPOS_DO_PEDIDO, troca), {});
});

test("a nova senha precisa de 8 caracteres e de uma confirmação igual", () => {
  assert.deepEqual(recoveryErrors(CAMPOS_DA_TROCA, troca), {});
  assert.deepEqual(
    recoveryErrors(CAMPOS_DA_TROCA, {
      ...troca,
      novaSenha: "1234567",
      confirmacao: "1234567",
    }),
    { novaSenha: "A senha deve ter no mínimo 8 caracteres." },
  );
  assert.deepEqual(
    recoveryErrors(CAMPOS_DA_TROCA, { ...troca, confirmacao: "NovaSenha-2" }),
    { confirmacao: "As senhas precisam ser iguais." },
  );
});

test("os erros da troca saem na ordem dos campos da tela", () => {
  const erros = recoveryErrors(CAMPOS_DA_TROCA, {
    codigo: "12345",
    novaSenha: "",
    confirmacao: "",
  });
  assert.deepEqual(Object.entries(erros), [
    ["codigo", "O código tem 6 dígitos."],
    ["novaSenha", "Informe a nova senha."],
    ["confirmacao", "Confirme sua senha."],
  ]);
});

test("código recusado mostra a mensagem genérica no campo do código", async () => {
  const { recovery } = apiFalsa({
    [TROCA]: { status: 400, body: { message: "qualquer texto do servidor" } },
  });
  const recusado = await recovery.resetPassword(troca).catch((e) => e);
  assert.deepEqual(resetErrors(recusado), {
    fields: { codigo: CODIGO_INVALIDO },
    form: "",
  });
});

test("campo recusado pela API mostra a mensagem dela no campo", async () => {
  const mensagem = "A nova senha deve ter no mínimo 8 caracteres";
  const { recovery } = apiFalsa({
    [TROCA]: {
      status: 400,
      body: { message: "Dados inválidos", campos: { novaSenha: mensagem } },
    },
  });
  const recusado = await recovery.resetPassword(troca).catch((e) => e);
  assert.deepEqual(resetErrors(recusado), {
    fields: { novaSenha: mensagem },
    form: "",
  });
});

test("falha que não é do código nem de um campo da tela vira mensagem geral", async () => {
  const foraDoAr = apiFalsa({ [TROCA]: { status: 500 } });
  const erro = await foraDoAr.recovery.resetPassword(troca).catch((e) => e);
  assert.deepEqual(resetErrors(erro), {
    fields: {},
    form: "A API não respondeu. Verifique se ela está no ar e tente de novo.",
  });
  // o e-mail não aparece no passo da troca: o erro dele não pode sumir
  const emailRecusado = apiFalsa({
    [TROCA]: {
      status: 400,
      body: { campos: { email: "O e-mail informado é inválido" } },
    },
  });
  const recusado = await emailRecusado.recovery
    .resetPassword(troca)
    .catch((e) => e);
  assert.deepEqual(resetErrors(recusado), {
    fields: {},
    form: "O e-mail informado é inválido",
  });
});

test("o 429 do pedido é bloqueio, com a mensagem do servidor", async () => {
  const mensagem = "Muitos pedidos de código. Aguarde para pedir um novo";
  const { recovery } = apiFalsa({
    [PEDIDO]: { status: 429, body: { message: mensagem } },
  });
  const bloqueado = await recovery
    .requestRecoveryCode("ana@saborcaseiro.com")
    .catch((e) => e);
  assert.equal(pedidoBloqueado(bloqueado), true);
  assert.equal(bloqueado.message, mensagem);
});
