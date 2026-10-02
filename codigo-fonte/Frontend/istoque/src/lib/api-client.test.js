import test from "node:test";
import assert from "node:assert/strict";
import { ApiError, createApiClient, errorMessage } from "./api-client.js";

// Resposta falsa no formato do fetch, para testar sem servidor.
const reply = (status, body) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === undefined ? "" : JSON.stringify(body)),
});

test("envia JSON para a URL da API e devolve o corpo da resposta", async () => {
  let call;
  const api = createApiClient({
    baseUrl: "/api",
    fetchFn: async (url, options) => {
      call = { url, options };
      return reply(200, { id: 1 })();
    },
  });
  assert.deepEqual(await api.post("/auth/login", { email: "a@b.com" }), {
    id: 1,
  });
  assert.equal(call.url, "/api/auth/login");
  assert.equal(call.options.method, "POST");
  assert.equal(call.options.headers["Content-Type"], "application/json");
  assert.equal(call.options.body, '{"email":"a@b.com"}');
});

test("erro da API vira ApiError com a mensagem e os campos", async () => {
  const api = createApiClient({
    fetchFn: reply(400, {
      status: 400,
      message: "Dados inválidos",
      campos: { cnpj: "CNPJ inválido" },
    }),
  });
  await assert.rejects(api.post("/auth/cadastro", {}), (error) => {
    assert.ok(error instanceof ApiError);
    assert.equal(error.status, 400);
    assert.equal(error.message, "Dados inválidos");
    assert.deepEqual(error.fields, { cnpj: "CNPJ inválido" });
    return true;
  });
});

test("erro 5xx sem corpo JSON (ex.: API fora do ar atrás do proxy) tem mensagem própria", async () => {
  const api = createApiClient({ fetchFn: reply(502) });
  await assert.rejects(api.get("/produtos"), /A API não respondeu/);
});

test("falha de rede vira ApiError sem status", async () => {
  const api = createApiClient({
    fetchFn: async () => {
      throw new TypeError("Failed to fetch");
    },
  });
  await assert.rejects(api.get("/produtos"), (error) => {
    assert.equal(error.status, 0);
    assert.match(error.message, /Não foi possível conectar/);
    return true;
  });
});

test("errorMessage prefere as mensagens dos campos", () => {
  assert.equal(
    errorMessage(
      new ApiError("Dados inválidos", { fields: { nome: "O nome é obrigatório" } }),
    ),
    "O nome é obrigatório",
  );
  assert.equal(errorMessage(new ApiError("E-mail ou senha incorretos.")), "E-mail ou senha incorretos.");
});
