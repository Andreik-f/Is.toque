import { api } from "@/lib/api-client.js";

// Rotas usadas pelo cadastro de produto: produtos, categorias e unidades de
// medida.

export const getProducts = () => api.get("/produtos/ativos");

export const createProduct = (body) => api.post("/produtos", body);

export const updateProduct = (id, body) => api.put(`/produtos/${id}`, body);

export const getCategories = () => api.get("/categorias");

export const createCategory = (body) => api.post("/categorias", body);

export const getUnits = () => api.get("/unidades-medida");
