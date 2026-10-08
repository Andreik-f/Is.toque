import test from "node:test";
import assert from "node:assert/strict";
import { NO_CATEGORY, productFromApi, productToApi } from "./product-api.js";

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
  assert.deepEqual(productToApi(productFromApi({ ...dto, descricao: "Peça de 1 kg" }), 7), {
    empresaId: 7,
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
  assert.equal("quantidadeAtual" in productToApi(productFromApi(dto), 7), false);
});
