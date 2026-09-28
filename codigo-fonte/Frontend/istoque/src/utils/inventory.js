// Regras de estoque compartilhadas por várias features (produtos, estoque,
// receitas e produção).
import { round } from "./format.js";
import { DEMO_TODAY } from "../config/demo.js";

export const isLow = (p) => p.stock <= p.min;

export const isExpiringSoon = (p, today = DEMO_TODAY) =>
  p.expiry && new Date(p.expiry + "T12:00:00-03:00") - today <= 3 * 86400000;

export function capacity(recipe, products) {
  return Math.max(
    0,
    Math.min(
      ...recipe.ingredients.map((i) =>
        Math.floor(
          ((products.find((p) => p.id === i.id)?.stock || 0) + 1e-9) / i.qty,
        ),
      ),
    ),
  );
}

export function bottleneck(recipe, products) {
  return recipe.ingredients
    .map((i) => ({ ...i, product: products.find((p) => p.id === i.id) }))
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
  if (!Number.isFinite(qty) || qty < 0 || (type !== "Ajuste" && qty === 0))
    throw Error("Informe uma quantidade válida.");
  if (product.unit === "un" && !Number.isInteger(qty))
    throw Error("Itens em unidades exigem uma quantidade inteira.");
  let stock =
    type === "Ajuste"
      ? qty
      : round(product.stock + (type === "Entrada" ? qty : -qty));
  if (stock < 0) throw Error("A quantidade supera o saldo disponível.");
  return { ...product, stock };
}
