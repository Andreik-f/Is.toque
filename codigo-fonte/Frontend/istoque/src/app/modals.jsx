import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { DEMO_TODAY_LABEL } from "@/config/demo.js";
import { ProductModal } from "@/features/products/components/product-modal.jsx";
import { ProductionModal } from "@/features/production/components/production-modal.jsx";
import { RecipeModal } from "@/features/recipes/components/recipe-modal.jsx";
import { AlertsModal } from "@/features/stock/components/alerts-modal.jsx";
import { MovementModal } from "@/features/stock/components/movement-modal.jsx";
import { UserModal } from "@/features/users/components/user-modal.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { isExpiringSoon } from "@/utils/inventory.js";

// Modais de operação, abertos de várias telas. Cada um grava o resultado no
// estado das telas (produtos também na API, com login) e mostra a confirmação.
export function AppModals() {
  const {
    demo,
    today,
    userName,
    categories,
    units,
    products,
    lowStock,
    saveProduct,
    createCategory,
    recipes,
    setRecipes,
    users,
    setUsers,
    registerMovement,
    registerProduction,
    openProduct,
  } = useDemoStore();
  const { session } = useSession();
  const { modal, closeModal, notify } = useUiStore();
  if (!modal) return null;
  // com login, movimentação, produção, receita e foto ainda não vão para a API
  const localOnly = Boolean(session);

  // movimentação e ficha técnica precisam de ao menos um produto
  if (["movement", "recipe"].includes(modal.type) && !products.length)
    return (
      <Modal
        title="Nenhum produto cadastrado"
        subtitle="Cadastre os produtos do estoque antes de continuar."
        onClose={closeModal}
      >
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={closeModal}>
            Fechar
          </Button>
          <Button
            type="button"
            onClick={() => {
              closeModal();
              navigate("estoque");
            }}
          >
            Ir para o estoque
          </Button>
        </div>
      </Modal>
    );

  if (modal.type === "production")
    return (
      <ProductionModal
        recipe={modal.recipe}
        products={products}
        userName={userName}
        localOnly={localOnly}
        onClose={closeModal}
        onConfirm={(qty) => registerProduction(modal.recipe, qty)}
      />
    );

  if (modal.type === "movement")
    return (
      <MovementModal
        products={products}
        selected={modal.product}
        localOnly={localOnly}
        onClose={closeModal}
        onSave={(id, type, qty, reason, expiry) => {
          registerMovement(id, type, qty, reason, expiry);
          closeModal();
          notify(
            localOnly
              ? "Movimentação registrada nesta página. Ela ainda não é gravada no servidor."
              : "Movimentação registrada. Saldo atualizado.",
          );
        }}
      />
    );

  if (modal.type === "product")
    return (
      <ProductModal
        product={modal.product}
        categories={categories}
        units={units}
        localOnly={localOnly}
        onClose={closeModal}
        onCreateCategory={createCategory}
        onSave={async (p) => {
          await saveProduct(p);
          closeModal();
          const done = modal.product
            ? "Produto atualizado."
            : "Produto cadastrado com saldo inicial zero.";
          notify(
            localOnly && p.photo
              ? done + " A foto ainda fica só nesta página."
              : done,
          );
        }}
      />
    );

  if (modal.type === "recipe")
    return (
      <RecipeModal
        products={products}
        recipe={modal.recipe}
        localOnly={localOnly}
        onClose={closeModal}
        onSave={(r) => {
          setRecipes(
            modal.recipe
              ? recipes.map((x) => (x.id === r.id ? r : x))
              : [...recipes, r],
          );
          closeModal();
          notify(
            localOnly
              ? "Ficha técnica salva nesta página. Ela ainda não é gravada no servidor."
              : "Ficha técnica salva. O estoque não foi alterado.",
          );
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
          notify(
            session
              ? "Usuário adicionado nesta página. A equipe ainda não é gravada no servidor."
              : "Usuário adicionado à demonstração.",
          );
        }}
      />
    );

  if (modal.type === "alerts")
    return (
      <AlertsModal
        expiring={products.filter((p) => isExpiringSoon(p, today))}
        low={lowStock}
        demoDate={demo ? DEMO_TODAY_LABEL : null}
        onClose={closeModal}
        onOpenProduct={openProduct}
      />
    );

  return null;
}
