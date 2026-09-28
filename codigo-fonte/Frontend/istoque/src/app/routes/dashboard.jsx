import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { FoodArt } from "@/components/ui/food-art.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { Stat } from "@/components/ui/stat.jsx";
import { routeSubtitle } from "@/config/paths.js";
import { ProductGrid } from "@/features/products/components/product-grid.jsx";
import { MovementsTable } from "@/features/stock/components/movements-table.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { capacity, isExpiringSoon, isLow } from "@/utils/inventory.js";

export function DashboardRoute() {
  const {
    products,
    recipes,
    history,
    selectedRecipe,
    setOnlyLow,
    openRecipe,
    openProduct,
  } = useDemoStore();
  const { openModal } = useUiStore();
  const low = products.filter(isLow),
    expiring = products.filter((p) => isExpiringSoon(p));
  const showLowStock = () => {
    setOnlyLow(true);
    navigate("estoque");
  };
  return (
    <>
      <PageHeading
        title="Tudo pronto para hoje?"
        subtitle={routeSubtitle("dashboard")}
        actions={
          <>
            <Button
              variant="secondary"
              icon="arrows"
              onClick={() => openModal({ type: "movement" })}
            >
              Movimentar estoque
            </Button>
            <Button
              variant="accent"
              icon="plus"
              onClick={() =>
                openModal({ type: "production", recipe: selectedRecipe })
              }
            >
              Registrar produção
            </Button>
          </>
        }
      />
      <section className="hero-banner">
        <div>
          <span className="eyebrow">DE OLHO NO QUE IMPORTA</span>
          <h2>
            Boa cozinha começa
            <br />
            com um bom estoque.
          </h2>
          <p>
            Você tem {low.length} ingredientes para repor.
            <br />
            Planeje agora e siga produzindo.
          </p>
          <Button
            variant="accent"
            icon="arrow"
            onClick={() => navigate("reposicao")}
          >
            Ver lista de reposição
          </Button>
        </div>
        <div className="hero-art">
          <div className="hero-circle" />
          <FoodArt kind="jar" />
          <FoodArt kind="tomato" />
          <FoodArt kind="leaf" />
          <div className="floating-label">
            <Icon name="check" size={18} />
            Tudo sob controle
          </div>
        </div>
      </section>
      <section className="stats">
        <Stat
          icon="box"
          value={products.length}
          label="Produtos cadastrados"
          detail="Visão completa do estoque"
        />
        <Stat
          icon="alert"
          value={low.length.toString().padStart(2, "0")}
          label="Precisam de reposição"
          detail="Saldo menor ou igual ao mínimo"
          tone="warning"
          onClick={showLowStock}
        />
        <Stat
          icon="clock"
          value={expiring.length.toString().padStart(2, "0")}
          label="Validade próxima"
          detail="Até 3 dias • base 26 set. 2026"
          tone="danger"
          onClick={() => openModal({ type: "alerts" })}
        />
        <Stat
          icon="recipe"
          value={recipes.length.toString().padStart(2, "0")}
          label="Receitas cadastradas"
          detail="Capacidade calculada em tempo real"
        />
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">ATENÇÃO AO ESTOQUE</span>
          <h2>Antes de faltar</h2>
        </div>
        <button className="text-button" onClick={showLowStock}>
          Ver todos <Icon name="arrow" size={17} />
        </button>
      </div>
      <ProductGrid products={low.slice(0, 4)} onOpen={openProduct} />
      <div className="dashboard-bottom">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Últimas movimentações</h2>
              <p>A rotina da cozinha, registrada.</p>
            </div>
            <button
              className="text-button"
              onClick={() => navigate("movimentacoes")}
            >
              Ver histórico <Icon name="arrow" size={16} />
            </button>
          </div>
          <MovementsTable rows={history.slice(0, 4)} compact />
        </section>
        <section className="production-preview">
          <span className="eyebrow">O QUE DÁ PARA PREPARAR?</span>
          <FoodArt kind="burger" />
          <h3>Hambúrguer da casa</h3>
          <div>
            <strong>{capacity(recipes[0], products)}</strong>
            <span>
              porções
              <br />
              disponíveis agora
            </span>
          </div>
          <Button variant="primary" onClick={() => openRecipe(recipes[0])}>
            Abrir ficha técnica <Icon name="arrow" size={16} />
          </Button>
        </section>
      </div>
    </>
  );
}
