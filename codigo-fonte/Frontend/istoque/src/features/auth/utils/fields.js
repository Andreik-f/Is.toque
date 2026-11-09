// Campos das telas de acesso, no contrato da API: POST /api/auth/login (e-mail
// e senha) e POST /api/auth/cadastro (empresa e administrador juntos).
export const signupFields = [
  {
    name: "razao_social",
    label: "Razão social",
    autoComplete: "organization",
    maxLength: 150,
  },
  {
    name: "cnpj",
    label: "CNPJ",
    maxLength: 18,
  },
  {
    name: "telefone",
    label: "Telefone da empresa (opcional)",
    type: "tel",
    autoComplete: "tel",
    inputMode: "tel",
    maxLength: 20,
    required: false,
  },
  {
    name: "nome",
    label: "Nome do responsável",
    autoComplete: "name",
    maxLength: 120,
  },
  {
    name: "email",
    label: "E-mail do usuário",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmacao",
    label: "Confirmar senha",
    type: "password",
    autoComplete: "new-password",
  },
];
export const loginFields = [
  {
    name: "email",
    label: "E-mail do usuário",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    type: "password",
    autoComplete: "current-password",
  },
];
