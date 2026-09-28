import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { ProductPhotoField } from "./product-photo-field.jsx";

export function ProductModal({ product, onClose, onSave }) {
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(product?.photo || "");
  const [photoPending, setPhotoPending] = useState(false);
  return (
    <Modal
      title={product ? "Editar produto" : "Novo produto"}
      subtitle="Comece pelos dados que sua equipe usa todos os dias."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (photoPending) return;
          const d = Object.fromEntries(new FormData(e.target));
          if (+d.max < +d.min) {
            setError("O estoque máximo precisa ser maior ou igual ao mínimo.");
            return;
          }
          onSave({
            ...product,
            id: product?.id || "produto-" + Date.now(),
            name: d.name.trim(),
            category: d.category,
            unit: product?.unit || d.unit,
            min: +d.min,
            max: +d.max,
            expiry: d.expiry || "",
            stock: product?.stock || 0,
            art: product?.art || "jar",
            photo,
          });
        }}
      >
        <ProductPhotoField
          value={photo}
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
        <div className="form-grid">
          <Field label="Categoria">
            <select name="category" defaultValue={product?.category}>
              {[
                "Hortifruti",
                "Proteínas",
                "Padaria",
                "Laticínios",
                "Mercearia",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Unidade de controle"
            hint={
              product ? "Unidade preservada para manter o histórico." : null
            }
          >
            <select
              name="unit"
              defaultValue={product?.unit || "kg"}
              disabled={!!product}
            >
              <option>kg</option>
              <option>L</option>
              <option>un</option>
            </select>
          </Field>
        </div>
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
            defaultValue={product?.max}
          />
        </div>
        <Field
          label="Validade (opcional)"
          name="expiry"
          type="date"
          defaultValue={product?.expiry}
        />
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
          <Button type="submit" disabled={photoPending}>
            Salvar produto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
