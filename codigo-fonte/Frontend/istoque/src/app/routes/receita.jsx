import React from "react";
import { Empty } from "@/components/ui/empty.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { RecipeDetails } from "@/features/recipes/components/recipe-details.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

// #receita/burger abre essa receita; #receita, sem id, a última aberta.
export function ReceitaRoute({ id }) {
  const { products, recipes, selectedRecipe } = useDemoStore();
  const { openModal } = useUiStore();
  const recipe = id ? recipes.find((r) => r.id === id) : selectedRecipe;
  return (
    <>
      <PageHeading
        title={routeTitle("receita")}
        subtitle={routeSubtitle("receita")}
      />
      <button className="back text-button" onClick={() => navigate("receitas")}>
        ← Voltar às receitas
      </button>
      {recipe ? (
        <RecipeDetails
          recipe={recipe}
          products={products}
          onEdit={() => openModal({ type: "recipe", recipe })}
          onProduce={() => openModal({ type: "production", recipe })}
          onPlanReplenishment={() => navigate("reposicao")}
        />
      ) : id ? (
        <Empty
          title="Receita não encontrada"
          text="Ela não existe mais nesta página. Volte às receitas e escolha outra."
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
