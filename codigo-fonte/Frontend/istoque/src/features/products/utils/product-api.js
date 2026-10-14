// Conversão entre o produto da API (ProdutoResponseDTO e ProdutoRequestDTO)
// e o produto usado nas telas.

export const NO_CATEGORY = "Sem categoria";

// O id vira texto, como nos dados de exemplo, porque os campos de seleção das
// telas devolvem texto. Validade do lote, foto e ilustração ainda não vêm da
// API: começam vazias.
export function productFromApi(dto) {
  return {
    id: String(dto.id),
    code: dto.codigo ?? "",
    description: dto.descricao ?? "",
    name: dto.nome,
    type: dto.tipo,
    categoryId: dto.categoriaId,
    category: dto.categoria ?? NO_CATEGORY,
    unitId: dto.unidadeMedidaId,
    unit: dto.unidadeMedida,
    stock: Number(dto.quantidadeAtual),
    min: Number(dto.estoqueMinimo),
    max: dto.estoqueMaximo == null ? null : Number(dto.estoqueMaximo),
    controlsExpiry: dto.controlaValidade,
    expiry: "",
    art: "jar",
    photo: "",
  };
}

// Mensagem de erro dos limites de estoque do formulário, ou "" se estão certos.
export const stockLimitsError = (min, max) =>
  max < min ? "O estoque máximo precisa ser maior ou igual ao mínimo." : "";

// Produto das telas a partir dos campos do formulário de cadastro/edição.
// `form` traz os valores em texto; `category` e `unit` são os escolhidos. O
// saldo, a validade do lote e a ilustração não vêm do formulário: ficam os do
// produto que está sendo editado.
export function productFromForm({ product, form, category, unit, photo }) {
  const controls = form.controlsExpiry === "on";
  return {
    ...product,
    name: form.name.trim(),
    type: form.type,
    categoryId: category?.id ?? null,
    category: category?.nome ?? NO_CATEGORY,
    unitId: unit.id,
    unit: unit.sigla,
    min: +form.min,
    max: +form.max,
    controlsExpiry: controls,
    expiry: controls ? product?.expiry || "" : "",
    stock: product?.stock || 0,
    art: product?.art || "jar",
    photo,
  };
}

// Corpo do cadastro e da edição. O saldo não vai: no cadastro ele começa em
// zero e, depois, só muda por movimentação (HT014).
export function productToApi(product, empresaId) {
  return {
    empresaId,
    categoriaId: product.categoryId ?? null,
    unidadeMedidaId: product.unitId,
    codigo: product.code || null,
    nome: product.name,
    descricao: product.description || null,
    tipo: product.type,
    estoqueMinimo: product.min,
    estoqueMaximo: product.max,
    controlaValidade: product.controlsExpiry,
  };
}
