import React from "react";
import { Empty } from "@/components/ui/empty.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { RecipeDetails } from "@/features/recipes/components/recipe-details.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

export function ReceitaRoute() {
  const { products, selectedRecipe } = useDemoStore();
  const { openModal } = useUiStore();
  return (
    <>
      <PageHeading
        title={routeTitle("receita")}
        subtitle={routeSubtitle("receita")}
      />
      <button className="back text-button" onClick={() => navigate("receitas")}>
        ← Voltar às receitas
      </button>
      {selectedRecipe ? (
        <RecipeDetails
          recipe={selectedRecipe}
          products={products}
          onEdit={() => openModal({ type: "recipe", recipe: selectedRecipe })}
          onProduce={() =>
            openModal({ type: "production", recipe: selectedRecipe })
          }
          onPlanReplenishment={() => navigate("reposicao")}
        />
      ) : (
        <Empty
          title="Nenhuma receita cadastrada"
          text="Cadastre a primeira ficha técnica na tela de receitas."
        />
      )}
    </>
  );
}
