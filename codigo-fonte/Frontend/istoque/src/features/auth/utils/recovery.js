import { errorMessage } from "../../../lib/api-client.js";
import { CODIGO_INVALIDO } from "../../../utils/sms-code.js";
import { formFieldErrors } from "./api-fields.js";
import { fieldError } from "./validation.js";

// Recuperação de senha por SMS (POST /api/auth/recuperar-senha e
// /recuperar-senha/confirmar). Os nomes dos campos são os da API.

// A mesma mensagem exista ou não a conta: a tela não revela quais e-mails
// estão cadastrados.
export const AVISO_DO_PEDIDO =
  "Se a conta existir e a empresa tiver um telefone confirmado, o administrador recebe o código por SMS. Peça o código a ele.";
export const SENHA_ALTERADA = "Senha alterada. Entre com a nova senha.";

export const CAMPOS_DO_PEDIDO = ["email"];
export const CAMPOS_DA_TROCA = ["codigo", "novaSenha", "confirmacao"];

export function createRecoveryApi(api) {
  return {
    requestRecoveryCode: (email) =>
      api.post("/auth/recuperar-senha", { email: email.trim() }),
    resetPassword: ({ email, codigo, novaSenha }) =>
      api.post("/auth/recuperar-senha/confirmar", {
        email: email.trim(),
        codigo,
        novaSenha,
      }),
  };
}

// Erros dos campos de um passo, na ordem em que aparecem na tela; só entram os
// campos com erro. typeMismatch é o navegador recusando o formato do e-mail.
export function recoveryErrors(names, values, { typeMismatch = false } = {}) {
  return Object.fromEntries(
    names
      .map((name) => [
        name,
        fieldError(
          { name, type: name === "email" ? "email" : undefined },
          values[name] ?? "",
          { senha: values.novaSenha, typeMismatch },
        ),
      ])
      .filter(([, error]) => error),
  );
}

// Onde mostrar a recusa da troca de senha: no campo que a API apontou, no
// código (o 400 sem campos, que não diz se o código está errado ou vencido) ou,
// no resto, em `form`, a mensagem geral do formulário.
export function resetErrors(error) {
  const fields = Object.fromEntries(
    Object.entries(formFieldErrors(error?.fields)).filter(([name]) =>
      CAMPOS_DA_TROCA.includes(name),
    ),
  );
  if (Object.keys(fields).length) return { fields, form: "" };
  if (error?.status === 400 && !error.fields)
    return { fields: { codigo: CODIGO_INVALIDO }, form: "" };
  return { fields: {}, form: errorMessage(error) };
}
