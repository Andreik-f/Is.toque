// Mesmos valores do campo tipo da API (enum TipoProduto).
export const PRODUCT_TYPES = [
  { value: "insumo", label: "Insumo" },
  { value: "revenda", label: "Revenda" },
  { value: "ambos", label: "Insumo e revenda" },
];

export const productTypeLabel = (value) =>
  PRODUCT_TYPES.find((t) => t.value === value)?.label ?? "Insumo";
