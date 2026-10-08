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

// #produto/12 abre o produto 12; #produto, sem id, o último aberto.
export function ProdutoRoute({ id }) {
  const { products, selectedProduct } = useDemoStore();
  const product = id ? products.find((p) => p.id === id) : selectedProduct;
  return (
    <>
      <PageHeading
        title={routeTitle("produto")}
        subtitle={routeSubtitle("produto")}
      />
      <button className="back text-button" onClick={() => navigate("estoque")}>
        ← Voltar ao estoque
      </button>
      {product ? (
        <ProductPanels product={product} />
      ) : id ? (
        <Empty
          title="Produto não encontrado"
          text="Ele pode ter sido desativado. Volte ao estoque e escolha outro."
        />
      ) : (
        <Empty
          title="Nenhum produto cadastrado"
          text="Cadastre o primeiro produto na tela de estoque."
        />
      )}
    </>
  );
}

function ProductPanels({ product }) {
  const { products, recipes, history, openRecipe } = useDemoStore();
  const { openModal } = useUiStore();
  return (
    <>
      <div className="detail-layout">
        <ProductDetails
          product={product}
          onMove={() => openModal({ type: "movement", product })}
          onEdit={() => openModal({ type: "product", product })}
        />
        <RecipeUsageList
          product={product}
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
          rows={history.filter((h) => h.productId === product.id)}
        />
      </section>
    </>
  );
}
