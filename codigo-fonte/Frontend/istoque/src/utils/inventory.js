// Regras de estoque compartilhadas por várias features (produtos, estoque,
// receitas e produção).
import { round } from "./format.js";

// Tipos de movimentação. O texto aparece nas telas e fica gravado no histórico.
export const MOVEMENT_TYPES = {
  entry: "Entrada",
  exit: "Saída",
  loss: "Perda",
  adjustment: "Ajuste",
  production: "Produção",
};

export const isLow = (p) => p.stock <= p.min;

// Quanto comprar para o saldo chegar ao máximo. O máximo é opcional na API:
// sem ele, a sugestão completa até o mínimo.
export const purchaseSuggestion = (p) =>
  round(Math.max(0, (p.max ?? p.min) - p.stock));

// Referência da barra de saldo (100%): o máximo ou, sem ele, o dobro do mínimo.
export const stockCap = (p) => p.max || Math.max(p.min * 2, p.stock) || 1;

// Validade em até 3 dias a partir de `today`: a data fixa da demonstração ou,
// com login, a data real.
export const isExpiringSoon = (p, today) =>
  p.expiry && new Date(p.expiry + "T12:00:00-03:00") - today <= 3 * 86400000;

// O produto só diz se controla validade; a data vem de cada entrada (lote).
// Nos dados de exemplo, quem já tem data controla validade.
export const controlsExpiry = (p) => p.controlsExpiry ?? Boolean(p.expiry);

// Registra a validade do lote que entrou. O produto mostra a do lote que
// vence primeiro.
export function registerLotExpiry(product, date) {
  if (!date) return product;
  const expiry =
    !product.expiry || date < product.expiry ? date : product.expiry;
  return { ...product, expiry };
}

// Produto de um ingrediente da receita. Se ele não está mais na lista (por
// exemplo, foi desativado), devolve um marcador com saldo zero: a receita
// continua abrindo e a capacidade fica em zero.
export function ingredientProduct(ingredient, products) {
  return (
    products.find((p) => p.id === ingredient.id) ?? {
      id: ingredient.id,
      name: "Produto indisponível",
      unit: "",
      stock: 0,
      min: 0,
    }
  );
}

// Porções inteiras que o saldo rende. A folga de 1e-9 evita perder uma porção
// por erro de ponto flutuante (ex.: 0,6 / 0,05 dá 11,999...).
export const portionsFrom = (stock, perPortion) =>
  Math.floor((stock + 1e-9) / perPortion);

export function capacity(recipe, products) {
  return Math.max(
    0,
    Math.min(
      ...recipe.ingredients.map((i) =>
        portionsFrom(ingredientProduct(i, products).stock || 0, i.qty),
      ),
    ),
  );
}

export function bottleneck(recipe, products) {
  return recipe.ingredients
    .map((i) => ({ ...i, product: ingredientProduct(i, products) }))
    .sort((a, b) => a.product.stock / a.qty - b.product.stock / b.qty)[0];
}

export function produce(recipe, qty, products) {
  if (!Number.isInteger(qty) || qty < 1)
    throw Error("Informe uma quantidade inteira maior que zero.");
  if (qty > capacity(recipe, products))
    throw Error("A quantidade excede a capacidade disponível.");
  return products.map((p) => {
    let i = recipe.ingredients.find((i) => i.id === p.id);
    return i ? { ...p, stock: round(p.stock - i.qty * qty) } : p;
  });
}

export function moveStock(product, type, qty) {
  const { entry, adjustment } = MOVEMENT_TYPES;
  if (!Number.isFinite(qty) || qty < 0 || (type !== adjustment && qty === 0))
    throw Error("Informe uma quantidade válida.");
  if (product.unit === "un" && !Number.isInteger(qty))
    throw Error("Itens em unidades exigem uma quantidade inteira.");
  let stock =
    type === adjustment
      ? qty
      : round(product.stock + (type === entry ? qty : -qty));
  if (stock < 0) throw Error("A quantidade supera o saldo disponível.");
  return { ...product, stock };
}
