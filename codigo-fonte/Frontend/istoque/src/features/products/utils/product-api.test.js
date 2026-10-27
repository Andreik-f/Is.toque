import test from "node:test";
import assert from "node:assert/strict";
import {
  NO_CATEGORY,
  productFromApi,
  productFromForm,
  productToApi,
  stockLimitsError,
} from "./product-api.js";

const dto = {
  id: 12,
  codigo: "QJ-001",
  nome: "Queijo minas",
  descricao: null,
  tipo: "insumo",
  empresaId: 7,
  categoriaId: 3,
  categoria: "Laticínios",
  unidadeMedidaId: 1,
  unidadeMedida: "kg",
  quantidadeAtual: 5.5,
  estoqueMinimo: 2,
  estoqueMaximo: 20,
  controlaValidade: true,
  ativo: true,
};

test("produto da API vira o produto das telas, com id em texto", () => {
  const product = productFromApi(dto);
  assert.equal(product.id, "12");
  assert.equal(product.name, "Queijo minas");
  assert.equal(product.category, "Laticínios");
  assert.equal(product.unit, "kg");
  assert.equal(product.stock, 5.5);
  assert.equal(product.min, 2);
  assert.equal(product.max, 20);
  assert.equal(product.controlsExpiry, true);
});

test("produto sem categoria nem estoque máximo", () => {
  const product = productFromApi({ ...dto, categoriaId: null, categoria: null, estoqueMaximo: null });
  assert.equal(product.categoryId, null);
  assert.equal(product.category, NO_CATEGORY);
  assert.equal(product.max, null);
});

test("ida e volta preserva os campos que a tela não edita (código e descrição)", () => {
  assert.deepEqual(productToApi(productFromApi({ ...dto, descricao: "Peça de 1 kg" })), {
    categoriaId: 3,
    unidadeMedidaId: 1,
    codigo: "QJ-001",
    nome: "Queijo minas",
    descricao: "Peça de 1 kg",
    tipo: "insumo",
    estoqueMinimo: 2,
    estoqueMaximo: 20,
    controlaValidade: true,
  });
});

test("o corpo enviado não leva o saldo", () => {
  assert.equal("quantidadeAtual" in productToApi(productFromApi(dto)), false);
});

test("o corpo enviado não leva o empresaId", () => {
  assert.equal("empresaId" in productToApi(productFromApi(dto)), false);
});

test("o máximo não pode ser menor que o mínimo", () => {
  assert.match(stockLimitsError(5, 2), /máximo/);
  assert.equal(stockLimitsError(2, 2), "");
  assert.equal(stockLimitsError(2, 10), "");
});

test("produto do formulário mantém saldo, validade e ilustração na edição", () => {
  const form = {
    name: "  Queijo  ",
    type: "insumo",
    min: "2",
    max: "10",
    controlsExpiry: "on",
  };
  const unit = { id: 1, sigla: "kg" };
  const edited = productFromForm({
    product: { id: "9", stock: 4, expiry: "2026-10-01", art: "cheese" },
    form,
    category: { id: 3, nome: "Laticínios" },
    unit,
    photo: "",
  });
  assert.equal(edited.name, "Queijo");
  assert.equal(edited.id, "9");
  assert.equal(edited.stock, 4);
  assert.equal(edited.expiry, "2026-10-01");
  assert.equal(edited.art, "cheese");
  assert.deepEqual([edited.min, edited.max], [2, 10]);

  const created = productFromForm({
    product: undefined,
    form: { ...form, controlsExpiry: undefined },
    category: undefined,
    unit,
    photo: "",
  });
  assert.equal(created.stock, 0);
  assert.equal(created.expiry, "");
  assert.equal(created.art, "jar");
  assert.equal(created.category, NO_CATEGORY);
  assert.equal(created.categoryId, null);
  assert.equal("id" in created, false);
});
