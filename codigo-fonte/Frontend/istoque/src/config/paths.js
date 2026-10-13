// Rotas da aplicação. A navegação usa o hash da URL (ex.: #estoque). As telas
// de detalhe levam o id do item: #produto/12, #receita/burger.
export const DEFAULT_ROUTE = "dashboard";

// "#produto/12" → { route: "produto", id: "12" }; sem id, id é null.
export function parseHash(hash) {
  const [route, id] = hash.replace(/^#/, "").split("/");
  return {
    route: route || DEFAULT_ROUTE,
    id: id ? decodeURIComponent(id) : null,
  };
}

// Rotas que abrem fora do layout principal (tela de acesso).
export const AUTH_ROUTES = ["login", "cadastro", "recuperar"];

// Telas que ainda não têm rota na API: com login, o que se registra nelas
// fica só na página até recarregar.
export const LOCAL_ONLY_ROUTES = [
  "movimentacoes",
  "receitas",
  "receita",
  "relatorios",
  "equipe",
];

// Itens do menu lateral: [rota, ícone, rótulo].
export const NAV_ITEMS = [
  ["dashboard", "home", "Visão geral"],
  ["estoque", "box", "Estoque"],
  ["movimentacoes", "arrows", "Movimentações"],
  ["receitas", "recipe", "Receitas"],
  ["reposicao", "plus", "Reposição"],
  ["relatorios", "chart", "Relatórios"],
  ["equipe", "users", "Equipe"],
];

// Itens do menu inferior do celular, na ordem em que aparecem.
export const MOBILE_NAV = [
  "dashboard",
  "estoque",
  "receitas",
  "movimentacoes",
  "relatorios",
];

// Telas de detalhe e o item do menu que fica marcado nelas.
const PARENT_ROUTES = { produto: "estoque", receita: "receitas" };

export const isNavActive = (item, route) =>
  item === route || PARENT_ROUTES[route] === item;

const EXTRA_TITLES = {
  receita: "Ficha técnica",
  produto: "Detalhes do produto",
  importacao: "Importar nota",
  fluxos: "Mapa de fluxos",
};

const SUBTITLES = {
  dashboard: "Seu estoque em ordem. Sua cozinha em movimento.",
  estoque: "Cada ingrediente no lugar certo, na hora certa.",
  receitas: "Transforme ingredientes em possibilidades.",
  movimentacoes: "Cada entrada e saída tem uma história.",
  reposicao: "Antecipe as compras e mantenha a cozinha abastecida.",
  relatorios: "Entenda o movimento da sua operação.",
  equipe: "As pessoas certas, com os acessos certos.",
  fluxos: "Um caminho claro entre cada tarefa.",
};

export function routeTitle(route) {
  return (
    NAV_ITEMS.find((n) => n[0] === route)?.[2] ||
    EXTRA_TITLES[route] ||
    "Visão geral"
  );
}

export function routeSubtitle(route) {
  return SUBTITLES[route] || "Informação clara para decidir com segurança.";
}
