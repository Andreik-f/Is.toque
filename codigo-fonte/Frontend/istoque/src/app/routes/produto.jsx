import React from "react";
import { Empty } from "@/components/ui/empty.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { ProductDetails } from "@/features/products/components/product-details.jsx";
import { RecipeUsageList } from "@/features/recipes/components/recipe-usage-list.jsx";
import { MovementsTable } from "@/features/stock/components/movements-table.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

export function ProdutoRoute() {
  const { selectedProduct } = useDemoStore();
  return (
    <>
      <PageHeading
        title={routeTitle("produto")}
        subtitle={routeSubtitle("produto")}
      />
      <button className="back text-button" onClick={() => navigate("estoque")}>
        ← Voltar ao estoque
      </button>
      {selectedProduct ? (
        <ProductPanels />
      ) : (
        <Empty
          title="Nenhum produto cadastrado"
          text="Cadastre o primeiro produto na tela de estoque."
        />
      )}
    </>
  );
}

function ProductPanels() {
  const { products, recipes, history, selectedProduct, openRecipe } =
    useDemoStore();
  const { openModal } = useUiStore();
  return (
    <>
      <div className="detail-layout">
        <ProductDetails
          product={selectedProduct}
          onMove={() =>
            openModal({ type: "movement", product: selectedProduct })
          }
          onEdit={() => openModal({ type: "product", product: selectedProduct })}
        />
        <RecipeUsageList
          product={selectedProduct}
          recipes={recipes}
          products={products}
          onOpen={openRecipe}
        />
      </div>
      <section className="panel history-panel">
        <div className="panel-heading">
          <h2>Histórico do ingrediente</h2>
        </div>
        <MovementsTable
          rows={history.filter((h) => h.product === selectedProduct.name)}
        />
      </section>
    </>
  );
}
