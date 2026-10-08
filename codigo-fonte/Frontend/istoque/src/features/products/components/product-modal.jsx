import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { errorMessage } from "@/lib/api-client.js";
import { controlsExpiry } from "@/utils/inventory.js";
import { NO_CATEGORY } from "../utils/product-api.js";
import { PRODUCT_TYPES } from "../utils/product-types.js";
import { ProductPhotoField } from "./product-photo-field.jsx";

const NEW_CATEGORY = "nova";

// Os campos seguem o cadastro de produto da API: tipo, categoria e unidade
// pelo id, e só a indicação de que o produto controla validade. A data de
// validade é informada em cada entrada de estoque. onSave e onCreateCategory
// devolvem promessas; se falharem, a mensagem aparece no formulário.
// localOnly: com login, avisa que a foto ainda não vai para a API.
export function ProductModal({
  product,
  categories,
  units,
  localOnly,
  onClose,
  onSave,
  onCreateCategory,
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState(product?.photo || "");
  const [photoPending, setPhotoPending] = useState(false);
  const [categoryChoice, setCategoryChoice] = useState(
    String(
      product?.categoryId ??
        categories.find((c) => c.nome === product?.category)?.id ??
        "",
    ),
  );
  const unitId =
    product?.unitId ??
    units.find((u) => u.sigla === product?.unit)?.id ??
    units[0]?.id;
  async function submit(e) {
    e.preventDefault();
    if (photoPending || saving) return;
    const d = Object.fromEntries(new FormData(e.target));
    if (+d.max < +d.min) {
      setError("O estoque máximo precisa ser maior ou igual ao mínimo.");
      return;
    }
    // a unidade não muda na edição (o campo fica desabilitado)
    const unit = units.find((u) => u.id === (product ? unitId : +d.unitId));
    if (!unit) {
      setError("Não há unidades de medida cadastradas no servidor.");
      return;
    }
    const controls = d.controlsExpiry === "on";
    setError("");
    setSaving(true);
    try {
      let category = categories.find((c) => c.id === +categoryChoice);
      if (categoryChoice === NEW_CATEGORY) {
        category = await onCreateCategory(d.newCategory.trim());
        // se o produto falhar depois, a categoria já existe: o campo fica nela
        setCategoryChoice(String(category.id));
      }
      await onSave({
        ...product,
        id: product?.id,
        name: d.name.trim(),
        type: d.type,
        categoryId: category?.id ?? null,
        category: category?.nome ?? NO_CATEGORY,
        unitId: unit.id,
        unit: unit.sigla,
        min: +d.min,
        max: +d.max,
        controlsExpiry: controls,
        expiry: controls ? product?.expiry || "" : "",
        stock: product?.stock || 0,
        art: product?.art || "jar",
        photo,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <Modal
      title={product ? "Editar produto" : "Novo produto"}
      subtitle="Comece pelos dados que sua equipe usa todos os dias."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <ProductPhotoField
          value={photo}
          localOnly={localOnly}
          onChange={setPhoto}
          onPending={setPhotoPending}
        />
        <Field
          label="Nome do produto"
          name="name"
          required
          defaultValue={product?.name}
          placeholder="Ex.: Tomate italiano"
        />
        <Field label="Tipo">
          <select name="type" defaultValue={product?.type || "insumo"}>
            {PRODUCT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field label="Categoria">
            <select
              name="categoryId"
              value={categoryChoice}
              onChange={(e) => setCategoryChoice(e.target.value)}
            >
              <option value="">{NO_CATEGORY}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
              <option value={NEW_CATEGORY}>+ Nova categoria</option>
            </select>
          </Field>
          <Field
            label="Unidade de controle"
            hint={
              product ? "Unidade preservada para manter o histórico." : null
            }
          >
            <select name="unitId" defaultValue={unitId} disabled={!!product}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.sigla})
                </option>
              ))}
            </select>
          </Field>
        </div>
        {categoryChoice === NEW_CATEGORY && (
          <Field
            label="Nome da nova categoria"
            name="newCategory"
            required
            maxLength={80}
            placeholder="Ex.: Hortifruti"
          />
        )}
        <div className="form-grid">
          <Field
            label="Estoque mínimo"
            name="min"
            type="number"
            min="0"
            step="0.001"
            required
            defaultValue={product?.min}
          />
          <Field
            label="Estoque máximo"
            name="max"
            type="number"
            min="0.001"
            step="0.001"
            required
            defaultValue={product?.max ?? ""}
          />
        </div>
        <div className="check-group">
          <label>
            <input
              type="checkbox"
              name="controlsExpiry"
              defaultChecked={product ? controlsExpiry(product) : false}
            />
            Controla validade
          </label>
          <small>A data de validade é informada em cada entrada de estoque.</small>
        </div>
        {!product && (
          <div className="notice">
            <Icon name="box" />
            <span>
              O produto inicia com saldo zero. Registre uma entrada para
              abastecer o estoque.
            </span>
          </div>
        )}
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={photoPending || saving}>
            {saving ? "Salvando..." : "Salvar produto"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
