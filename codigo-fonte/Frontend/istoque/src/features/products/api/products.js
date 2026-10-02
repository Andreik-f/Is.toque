import { api } from "@/lib/api-client.js";

// Rotas usadas pelo cadastro de produto: produtos, categorias e unidades de
// medida. A empresa vai por parâmetro até o isolamento por empresa (HT002)
// passar a usar a do usuário autenticado.

export const getProducts = (empresaId) =>
  api.get(`/produtos/ativos?empresaId=${empresaId}`);

export const createProduct = (body) => api.post("/produtos", body);

export const updateProduct = (id, body) => api.put(`/produtos/${id}`, body);

export const getCategories = (empresaId) =>
  api.get(`/categorias?empresaId=${empresaId}`);

export const createCategory = (body) => api.post("/categorias", body);

export const getUnits = () => api.get("/unidades-medida");
