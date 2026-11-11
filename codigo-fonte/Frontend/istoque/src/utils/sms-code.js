import { errorMessage } from "../lib/api-client.js";

// Regras dos códigos enviados por SMS, iguais na confirmação do telefone da
// empresa e na recuperação de senha.

export const CODIGO_INVALIDO = "Código inválido ou vencido.";
export const SEGUNDOS_ENTRE_CODIGOS = 60;

// Código errado, vencido, já usado ou sem tentativas: o servidor responde igual
// e a tela também, sem dizer qual dos casos.
export const erroDoCodigo = (error) =>
  error?.status === 400 ? CODIGO_INVALIDO : errorMessage(error);

// 429 vale tanto para o intervalo de 60 s quanto para o limite por hora, e o
// servidor não diz quanto falta: a tela mostra a mensagem dele e não conta.
export const pedidoBloqueado = (error) => error?.status === 429;

// Texto do botão de reenvio: `restante` são os segundos até poder pedir de novo.
export const rotuloDoReenvio = (restante) =>
  restante > 0 ? `Enviar novo código em ${restante}s` : "Enviar novo código";
