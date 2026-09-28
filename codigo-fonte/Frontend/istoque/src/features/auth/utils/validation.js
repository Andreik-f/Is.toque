// Mesmas regras do cadastro na API (CadastroRequestDTO), para a tela avisar
// antes de enviar.
const CNPJ_PATTERN =
  /^(?:[A-Za-z0-9]{12}\d{2}|[A-Za-z0-9]{2}\.[A-Za-z0-9]{3}\.[A-Za-z0-9]{3}\/[A-Za-z0-9]{4}-\d{2})$/;

export const SENHA_MINIMA = 8;

// 14 caracteres, com ou sem máscara; aceita o CNPJ alfanumérico.
export const cnpjValido = (value) => CNPJ_PATTERN.test(value.trim());
