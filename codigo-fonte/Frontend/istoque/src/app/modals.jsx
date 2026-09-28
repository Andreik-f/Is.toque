import React from "react";
import { ProductModal } from "@/features/products/components/product-modal.jsx";
import { ProductionModal } from "@/features/production/components/production-modal.jsx";
import { RecipeModal } from "@/features/recipes/components/recipe-modal.jsx";
import { AlertsModal } from "@/features/stock/components/alerts-modal.jsx";
import { MovementModal } from "@/features/stock/components/movement-modal.jsx";
import { UserModal } from "@/features/users/components/user-modal.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { round } from "@/utils/format.js";
import {
  isExpiringSoon,
  isLow,
  moveStock,
  produce,
} from "@/utils/inventory.js";

// Modais de operação, abertos de várias telas. Cada um grava o resultado no
// estado da demonstração e mostra a confirmação.
export function AppModals() {
  const {
    products,
    setProducts,
    recipes,
    setRecipes,
    users,
    setUsers,
    addHistory,
    openProduct,
  } = useDemoStore();
  const { modal, closeModal, notify } = useUiStore();
  if (!modal) return null;

  if (modal.type === "production")
    return (
      <ProductionModal
        recipe={modal.recipe}
        products={products}
        onClose={closeModal}
        onConfirm={(qty) => {
          setProducts(produce(modal.recipe, qty, products));
          addHistory(
            modal.recipe.ingredients.map((i) => {
              const p = products.find((p) => p.id === i.id);
              return {
                type: "Produção",
                product: p.name,
                qty: round(i.qty * qty),
                unit: p.unit,
                reason: `${qty} × ${modal.recipe.name}`,
              };
            }),
          );
        }}
      />
    );

  if (modal.type === "movement")
    return (
      <MovementModal
        products={products}
        selected={modal.product}
        onClose={closeModal}
        onSave={(id, type, qty, reason) => {
          const p = products.find((p) => p.id === id),
            updated = moveStock(p, type, qty);
          setProducts(products.map((p) => (p.id === id ? updated : p)));
          addHistory([{ type, product: p.name, qty, unit: p.unit, reason }]);
          closeModal();
          notify("Movimentação registrada. Saldo atualizado.");
        }}
      />
    );

  if (modal.type === "product")
    return (
      <ProductModal
        product={modal.product}
        onClose={closeModal}
        onSave={(p) => {
          setProducts(
            modal.product
              ? products.map((x) => (x.id === p.id ? p : x))
              : [...products, p],
          );
          closeModal();
          notify(
            modal.product
              ? "Produto atualizado."
              : "Produto cadastrado com saldo inicial zero.",
          );
        }}
      />
    );

  if (modal.type === "recipe")
    return (
      <RecipeModal
        products={products}
        recipe={modal.recipe}
        onClose={closeModal}
        onSave={(r) => {
          setRecipes(
            modal.recipe
              ? recipes.map((x) => (x.id === r.id ? r : x))
              : [...recipes, r],
          );
          closeModal();
          notify("Ficha técnica salva. O estoque não foi alterado.");
        }}
      />
    );

  if (modal.type === "user")
    return (
      <UserModal
        onClose={closeModal}
        onSave={(u) => {
          setUsers([...users, u]);
          closeModal();
          notify("Usuário adicionado à demonstração.");
        }}
      />
    );

  if (modal.type === "alerts")
    return (
      <AlertsModal
        expiring={products.filter((p) => isExpiringSoon(p))}
        low={products.filter(isLow)}
        onClose={closeModal}
        onOpenProduct={openProduct}
      />
    );

  return null;
}
