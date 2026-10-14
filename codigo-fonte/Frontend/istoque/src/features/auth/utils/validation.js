// Mesmas regras do cadastro na API (CadastroRequestDTO), para a tela avisar
// antes de enviar.
const CNPJ_PATTERN =
  /^(?:[A-Za-z0-9]{12}\d{2}|[A-Za-z0-9]{2}\.[A-Za-z0-9]{3}\.[A-Za-z0-9]{3}\/[A-Za-z0-9]{4}-\d{2})$/;

export const SENHA_MINIMA = 8;

// 14 caracteres, com ou sem máscara; aceita o CNPJ alfanumérico.
export const cnpjValido = (value) => CNPJ_PATTERN.test(value.trim());

const REQUIRED_MESSAGES = {
  razao_social: "Informe a razão social.",
  cnpj: "Informe o CNPJ.",
  nome: "Informe o nome do responsável.",
  email: "Informe seu e-mail.",
  senha: "Informe sua senha.",
  confirmacao: "Confirme sua senha.",
};

// Mensagem de erro de um campo das telas de acesso, ou "" se ele está certo.
// `name` e `type` vêm da configuração do campo; `value` é o que foi digitado.
// Em `context`: signup (cadastro, não login), senha (valor do campo senha) e
// typeMismatch (o navegador recusou o formato do e-mail).
export function fieldError(
  { name, type },
  value,
  { signup, senha, typeMismatch },
) {
  if (!value || (["nome", "razao_social"].includes(name) && !value.trim()))
    return REQUIRED_MESSAGES[name];
  if (name === "cnpj" && !cnpjValido(value))
    return "O CNPJ deve ter 14 caracteres, com ou sem máscara.";
  if (type === "email" && typeMismatch) return "Digite um e-mail válido.";
  if (signup && name === "senha" && value.length < SENHA_MINIMA)
    return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`;
  if (name === "confirmacao" && value !== senha)
    return "As senhas precisam ser iguais.";
  return "";
}
