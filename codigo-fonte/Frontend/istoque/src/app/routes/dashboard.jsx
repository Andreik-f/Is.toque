import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { FoodArt } from "@/components/ui/food-art.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { Stat } from "@/components/ui/stat.jsx";
import { DEMO_TODAY_LABEL } from "@/config/demo.js";
import { routeSubtitle } from "@/config/paths.js";
import { PhoneNoticeGate } from "@/features/company/components/phone-notice.jsx";
import { ProductGrid } from "@/features/products/components/product-grid.jsx";
import { MovementsTable } from "@/features/stock/components/movements-table.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { plural } from "@/utils/format.js";
import { capacity, isExpiringSoon } from "@/utils/inventory.js";

export function DashboardRoute() {
  const {
    demo,
    today,
    products,
    lowStock: low,
    recipes,
    history,
    selectedRecipe,
    setOnlyLow,
    openRecipe,
    openProduct,
  } = useDemoStore();
  const { openModal } = useUiStore();
  const expiring = products.filter((p) => isExpiringSoon(p, today));
  const portions = selectedRecipe ? capacity(selectedRecipe, products) : 0;
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
              disabled={!selectedRecipe}
              title={selectedRecipe ? undefined : "Cadastre uma receita antes"}
              onClick={() =>
                openModal({ type: "production", recipe: selectedRecipe })
              }
            >
              Registrar produção
            </Button>
          </>
        }
      />
      <PhoneNoticeGate />
      <section className="hero-banner">
        <div>
          <span className="eyebrow">DE OLHO NO QUE IMPORTA</span>
          <h2>
            Boa cozinha começa
            <br />
            com um bom estoque.
          </h2>
          <p>
            Você tem {plural(low.length, "ingrediente", "ingredientes")} para
            repor.
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
          detail={demo ? `Até 3 dias • base ${DEMO_TODAY_LABEL}` : "Até 3 dias"}
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
          {selectedRecipe ? (
            <>
              <FoodArt kind={selectedRecipe.art} />
              <h3>{selectedRecipe.name}</h3>
              <div>
                <strong>{portions}</strong>
                <span>
                  {portions === 1 ? "porção" : "porções"}
                  <br />
                  {portions === 1 ? "disponível agora" : "disponíveis agora"}
                </span>
              </div>
              <Button
                variant="primary"
                onClick={() => openRecipe(selectedRecipe)}
              >
                Abrir ficha técnica <Icon name="arrow" size={16} />
              </Button>
            </>
          ) : (
            <>
              <FoodArt kind="bowl" />
              <h3>Nenhuma receita cadastrada</h3>
              <Button
                variant="primary"
                onClick={() => openModal({ type: "recipe" })}
              >
                Nova receita <Icon name="arrow" size={16} />
              </Button>
            </>
          )}
        </section>
      </div>
    </>
  );
}
