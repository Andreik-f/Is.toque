// Campos das telas de acesso, no contrato da API: POST /api/auth/login (e-mail
// e senha) e POST /api/auth/cadastro (empresa e administrador juntos).
export const signupFields = [
  {
    name: "razao_social",
    label: "Razão social",
    placeholder: "Nome registrado da empresa",
    autoComplete: "organization",
    maxLength: 150,
  },
  {
    name: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    maxLength: 18,
  },
  {
    name: "nome",
    label: "Nome do responsável",
    placeholder: "Seu nome completo",
    autoComplete: "name",
    maxLength: 120,
  },
  {
    name: "email",
    label: "E-mail do usuário",
    placeholder: "voce@exemplo.com",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    placeholder: "Digite sua senha",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmacao",
    label: "Confirmar senha",
    placeholder: "Repita sua senha",
    type: "password",
    autoComplete: "new-password",
  },
];
export const loginFields = [
  {
    name: "email",
    label: "E-mail do usuário",
    placeholder: "voce@exemplo.com",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    placeholder: "Digite sua senha",
    type: "password",
    autoComplete: "current-password",
  },
];
