import React, { createContext, useContext, useState } from "react";
import { navigate } from "@/hooks/use-hash-route.js";
import {
  productsSeed,
  recipesSeed,
  historySeed,
  usersSeed,
} from "@/testing/mocks/seed-data.js";

// Estado da demonstração, em memória: recarregar a página volta aos dados
// fictícios. Será substituído pelas chamadas à API.
const DemoStoreContext = createContext(null);

export function DemoStoreProvider({ children }) {
  const [products, setProducts] = useState(productsSeed),
    [recipes, setRecipes] = useState(recipesSeed),
    [history, setHistory] = useState(historySeed),
    [users, setUsers] = useState(usersSeed);
  const [onlyLow, setOnlyLow] = useState(false);
  const [recipeId, setRecipeId] = useState("burger"),
    [productId, setProductId] = useState("tomate");

  const selectedRecipe = recipes.find((r) => r.id === recipeId) || recipes[0],
    selectedProduct = products.find((p) => p.id === productId) || products[0];

  const addHistory = (rows) =>
    setHistory((h) => [
      ...rows.map((r, i) => ({
        ...r,
        id: "MOV-" + Date.now() + "-" + i,
        date: new Date().toISOString(),
        user: "David Rocha",
      })),
      ...h,
    ]);
  const openRecipe = (r) => {
    setRecipeId(r.id);
    navigate("receita");
  };
  const openProduct = (p) => {
    setProductId(p.id);
    navigate("produto");
  };
  const resetData = () => {
    setProducts(productsSeed);
    setRecipes(recipesSeed);
    setHistory(historySeed);
    setUsers(usersSeed);
    setOnlyLow(false);
  };

  const value = {
    products,
    setProducts,
    recipes,
    setRecipes,
    history,
    users,
    setUsers,
    onlyLow,
    setOnlyLow,
    selectedRecipe,
    selectedProduct,
    addHistory,
    openRecipe,
    openProduct,
    resetData,
  };
  return (
    <DemoStoreContext.Provider value={value}>
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  return useContext(DemoStoreContext);
}
