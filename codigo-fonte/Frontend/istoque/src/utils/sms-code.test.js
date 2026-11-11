import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../lib/api-client.js";
import {
  CODIGO_INVALIDO,
  SEGUNDOS_ENTRE_CODIGOS,
  erroDoCodigo,
  pedidoBloqueado,
  rotuloDoReenvio,
} from "./sms-code.js";

test("o 400 do código vira a mensagem genérica, qualquer que seja o texto do servidor", () => {
  const recusado = new ApiError("Código vencido às 10:15", { status: 400 });
  assert.equal(erroDoCodigo(recusado), CODIGO_INVALIDO);
});

test("erro que não é do código mantém a mensagem do servidor", () => {
  const mensagem =
    "Não foi possível enviar o SMS agora. Tente novamente mais tarde";
  assert.equal(erroDoCodigo(new ApiError(mensagem, { status: 503 })), mensagem);
});

test("só o 429 conta como pedido bloqueado", () => {
  assert.equal(pedidoBloqueado(new ApiError("", { status: 429 })), true);
  assert.equal(pedidoBloqueado(new ApiError("", { status: 400 })), false);
  assert.equal(pedidoBloqueado(undefined), false);
});

test("o reenvio conta os 60 segundos no botão e libera no zero", () => {
  assert.equal(
    rotuloDoReenvio(SEGUNDOS_ENTRE_CODIGOS),
    "Enviar novo código em 60s",
  );
  assert.equal(rotuloDoReenvio(1), "Enviar novo código em 1s");
  assert.equal(rotuloDoReenvio(0), "Enviar novo código");
});
