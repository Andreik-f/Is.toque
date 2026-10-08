import React, { createContext, useContext, useState } from "react";
import { DEMO_PROFILE, DEMO_TODAY, demoNow } from "@/config/demo.js";
import { navigate } from "@/hooks/use-hash-route.js";
import {
  productsSeed,
  recipesSeed,
  historySeed,
  usersSeed,
  categoriesSeed,
  unitsSeed,
} from "@/testing/mocks/seed-data.js";

// Estado das telas, em memória. Sem login, começa com os dados fictícios da
// demonstração. Com login, app/company-data.jsx entrega em `initial` os dados
// da empresa vindos da API e, em `persist`, as funções que gravam produtos e
// categorias na API. O que ainda não tem rota na API (receitas,
// movimentações, equipe) fica só na memória: recarregar a página desfaz.
const DemoStoreContext = createContext(null);

const DEMO_DATA = {
  products: productsSeed,
  recipes: recipesSeed,
  history: historySeed,
  users: usersSeed,
  categories: categoriesSeed,
  units: unitsSeed,
  userName: DEMO_PROFILE.userName,
};

const byName = (a, b) => a.nome.localeCompare(b.nome, "pt-BR");

export function DemoStoreProvider({ children, initial = DEMO_DATA, persist }) {
  const [products, setProducts] = useState(initial.products);
  const [recipes, setRecipes] = useState(initial.recipes);
  const [history, setHistory] = useState(initial.history);
  const [users, setUsers] = useState(initial.users);
  const [categories, setCategories] = useState(initial.categories);
  const [onlyLow, setOnlyLow] = useState(false);
  // último produto e última receita abertos: valem para #produto e #receita
  // sem id na URL e para o botão "Registrar produção" do painel
  const [recipeId, setRecipeId] = useState("burger");
  const [productId, setProductId] = useState("tomate");

  const selectedRecipe = recipes.find((r) => r.id === recipeId) || recipes[0];
  const selectedProduct =
    products.find((p) => p.id === productId) || products[0];

  // "Hoje" das telas: na demonstração, a data fixa dos dados de exemplo; com
  // login, a data real.
  const demo = initial === DEMO_DATA;
  const today = demo ? DEMO_TODAY : new Date();
  const now = demo ? demoNow : () => new Date();

  const addHistory = (rows) =>
    setHistory((h) => [
      ...rows.map((r, i) => ({
        ...r,
        id: "MOV-" + Date.now() + "-" + i,
        date: now().toISOString(),
        user: initial.userName,
      })),
      ...h,
    ]);
  const openRecipe = (r) => {
    setRecipeId(r.id);
    navigate("receita", r.id);
  };
  const openProduct = (p) => {
    setProductId(p.id);
    navigate("produto", p.id);
  };
  // Cadastra (sem id) ou atualiza o produto e devolve o produto gravado.
  const saveProduct = async (product) => {
    const saved = persist
      ? await persist.saveProduct(product)
      : { ...product, id: product.id || "produto-" + Date.now() };
    setProducts((list) =>
      list.some((p) => p.id === saved.id)
        ? list.map((p) => (p.id === saved.id ? saved : p))
        : [...list, saved],
    );
    return saved;
  };
  const createCategory = async (nome) => {
    const category = persist
      ? await persist.createCategory(nome)
      : { id: Date.now(), nome };
    setCategories((list) => [...list, category].sort(byName));
    return category;
  };
  const resetData = () => {
    setProducts(initial.products);
    setRecipes(initial.recipes);
    setHistory(initial.history);
    setUsers(initial.users);
    setCategories(initial.categories);
    setOnlyLow(false);
  };

  const value = {
    demo,
    today,
    userName: initial.userName,
    categories,
    units: initial.units,
    products,
    setProducts,
    saveProduct,
    createCategory,
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
