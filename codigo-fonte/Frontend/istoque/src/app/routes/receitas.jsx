import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { RecipeGrid } from "@/features/recipes/components/recipe-grid.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

export function ReceitasRoute() {
  const { products, recipes, openRecipe } = useDemoStore();
  const { openModal } = useUiStore();
  const [search, setSearch] = useState("");
  const found = recipes.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        title={routeTitle("receitas")}
        subtitle={routeSubtitle("receitas")}
        actions={
          <Button icon="plus" onClick={() => openModal({ type: "recipe" })}>
            Nova receita
          </Button>
        }
      />
      <div className="notice">
        <Icon name="recipe" />
        <span>
          A ficha técnica define o consumo por porção. O estoque só é baixado
          ao confirmar uma produção.
        </span>
      </div>
      <div className="filter-bar">
        <label className="search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Encontre uma receita..."
            aria-label="Buscar receita"
          />
        </label>
        <span className="result-count">
          {recipes.length} {recipes.length === 1 ? "ficha técnica" : "fichas técnicas"}
        </span>
      </div>
      {found.length ? (
        <RecipeGrid recipes={found} products={products} onOpen={openRecipe} />
      ) : (
        <Empty />
      )}
    </>
  );
}
