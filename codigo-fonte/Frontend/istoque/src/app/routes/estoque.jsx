import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { ProductGrid } from "@/features/products/components/product-grid.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { isLow } from "@/utils/inventory.js";

export function EstoqueRoute() {
  const { products, onlyLow, setOnlyLow, openProduct } = useDemoStore();
  const { openModal } = useUiStore();
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState("Todos");
  const low = products.filter(isLow);
  const visible = products.filter(
    (p) =>
      (!search || p.name.toLowerCase().includes(search.toLowerCase())) &&
      (category === "Todos" || p.category === category) &&
      (!onlyLow || isLow(p)),
  );
  return (
    <>
      <PageHeading
        title={routeTitle("estoque")}
        subtitle={routeSubtitle("estoque")}
        actions={
          <>
            <Button
              variant="secondary"
              icon="upload"
              onClick={() => navigate("importacao")}
            >
              Importar nota
            </Button>
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
          <span className="result-count">{visible.length} produtos</span>
        </div>
      </div>
      <div className="tabs">
        {["Todos", ...new Set(products.map((p) => p.category))].map((c) => (
          <button
            key={c}
            className={category === c ? "selected" : ""}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      {visible.length ? (
        <ProductGrid products={visible} onOpen={openProduct} />
      ) : (
        <Empty
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("Todos");
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
