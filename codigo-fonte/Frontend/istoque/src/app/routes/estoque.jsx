import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { ProductGrid } from "@/features/products/components/product-grid.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { ALL, filterProducts } from "@/utils/filters.js";

export function EstoqueRoute() {
  const {
    products,
    lowStock: low,
    onlyLow,
    setOnlyLow,
    openProduct,
  } = useDemoStore();
  const { session } = useSession();
  const { openModal } = useUiStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const visible = filterProducts(products, { search, category, onlyLow });
  return (
    <>
      <PageHeading
        title={routeTitle("estoque")}
        subtitle={routeSubtitle("estoque")}
        actions={
          <>
            {/* a importação é uma simulação com os produtos da demonstração */}
            {!session && (
              <Button
                variant="secondary"
                icon="upload"
                onClick={() => navigate("importacao")}
              >
                Importar nota
              </Button>
            )}
            <Button icon="plus" onClick={() => openModal({ type: "product" })}>
              Novo produto
            </Button>
          </>
        }
      />
      <div className="filter-bar">
        <label className="search">
          <Icon name="search" />
          <input
            aria-label="Buscar ingrediente"
            placeholder="Buscar ingrediente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <div className="filter-right">
          <label className="check-filter">
            <input
              type="checkbox"
              checked={onlyLow}
              onChange={(e) => setOnlyLow(e.target.checked)}
            />
            Somente estoque baixo <b>{low.length}</b>
          </label>
          <span className="result-count">
            {visible.length} {visible.length === 1 ? "produto" : "produtos"}
          </span>
        </div>
      </div>
      <div className="tabs">
        {[ALL, ...new Set(products.map((p) => p.category))].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ProductGrid products={visible} onOpen={openProduct} />
      ) : !products.length ? (
        <Empty
          title="Nenhum produto cadastrado"
          text="Cadastre o primeiro produto para começar a controlar o estoque."
          action={
            <Button icon="plus" onClick={() => openModal({ type: "product" })}>
              Novo produto
            </Button>
          }
        />
      ) : (
        <Empty
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory(ALL);
                setOnlyLow(false);
              }}
            >
              Limpar filtros
            </Button>
          }
        />
      )}
    </>
  );
}
