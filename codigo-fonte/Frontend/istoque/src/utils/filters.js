// Regras de filtro das listas (estoque, movimentações, receitas e relatórios),
// fora das telas para poderem ser testadas.
import { isLow } from "./inventory.js";

// Opção "sem filtro" das abas de categoria e do seletor de tipo.
export const ALL = "Todos";

// Minúsculas e sem acento: "Limão" vira "limao".
const plain = (text) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

// Busca por parte do texto, sem diferenciar maiúsculas nem acentos.
export const matchesSearch = (text, search) =>
  plain(text).includes(plain(search));

export const filterProducts = (products, { search, category, onlyLow }) =>
  products.filter(
    (p) =>
      matchesSearch(p.name, search) &&
      (category === ALL || p.category === category) &&
      (!onlyLow || isLow(p)),
  );

export const filterMovements = (rows, { search, type }) =>
  rows.filter(
    (h) =>
      (type === ALL || h.type === type) &&
      matchesSearch(`${h.product} ${h.reason}`, search),
  );

export const PERIODS = ["Todos os registros", "Hoje", "7 dias", "30 dias"];

const DAY = 86400000;

// `date` é o registro (texto ISO); `today`, o "hoje" das telas.
export function inPeriod(date, period, today) {
  if (period === PERIODS[0]) return true;
  if (period === "Hoje")
    return new Date(date).toLocaleDateString() === today.toLocaleDateString();
  const days = period === "7 dias" ? 7 : 30;
  return new Date(date) >= new Date(today.getTime() - days * DAY);
}
