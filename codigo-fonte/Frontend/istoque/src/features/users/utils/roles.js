// Mesmos nomes dos perfis padrão da API. Quando o front for ligado à API,
// a lista deve vir de GET /api/perfis em vez de ficar fixa aqui.
// Do perfil com mais acesso ao com menos.
export const ROLES = [
  {
    name: "Administrador",
    description: "Gerencia empresa, equipe, perfis e toda a operação.",
  },
  {
    name: "Gerente",
    description: "Gerencia estoque, fichas técnicas, produção e relatórios.",
  },
  {
    name: "Funcionário",
    description:
      "Consulta estoque e receitas; registra entradas, saídas e produção.",
  },
];
