import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";

// localOnly: com login, avisa que a ficha ainda não vai para a API.
export function RecipeModal({ products, recipe, localOnly, onClose, onSave }) {
  const [items, setItems] = useState(
    recipe?.ingredients || [{ id: products[0].id, qty: 0.05 }],
  );
  const [error, setError] = useState("");
  return (
    <Modal
      wide
      title={recipe ? "Editar ficha técnica" : "Nova ficha técnica"}
      subtitle="Defina o consumo para uma unidade ou porção."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (new Set(items.map((i) => i.id)).size !== items.length) {
            setError("Cada ingrediente deve aparecer apenas uma vez.");
            return;
          }
          if (items.some((i) => !Number.isFinite(i.qty) || i.qty <= 0)) {
            setError("Informe quantidades maiores que zero.");
            return;
          }
          const d = Object.fromEntries(new FormData(e.target));
          onSave({
            id: recipe?.id || "receita-" + Date.now(),
            name: d.name,
            category: d.category,
            portion: d.portion,
            time: +d.time,
            art: recipe?.art || "bowl",
            ingredients: items,
          });
        }}
      >
        <Field
          label="Nome da receita"
          name="name"
          required
          defaultValue={recipe?.name}
        />
        <div className="form-grid">
          <Field label="Categoria">
            <select name="category" defaultValue={recipe?.category}>
              <option>Lanches</option>
              <option>Refeições</option>
              <option>Entradas</option>
            </select>
          </Field>
          <Field
            label="Rendimento base"
            name="portion"
            required
            defaultValue={recipe?.portion || "1 porção"}
          />
        </div>
        <Field
          label="Tempo de preparo (minutos)"
          name="time"
          type="number"
          min="1"
          step="1"
          required
          defaultValue={recipe?.time || 20}
        />
        <h3 className="review-title">Ingredientes</h3>
        {items.map((i, index) => (
          <div className="ingredient-editor" key={index}>
            <select
              aria-label={"Ingrediente " + (index + 1)}
              value={i.id}
              onChange={(e) =>
                setItems(
                  items.map((x, j) =>
                    j === index ? { ...x, id: e.target.value } : x,
                  ),
                )
              }
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.001"
              step="0.001"
              required
              aria-label={"Quantidade do ingrediente " + (index + 1)}
              value={i.qty}
              onChange={(e) =>
                setItems(
                  items.map((x, j) =>
                    j === index
                      ? {
                          ...x,
                          qty: e.target.value === "" ? "" : +e.target.value,
                        }
                      : x,
                  ),
                )
              }
            />
            <button
              className="icon-button"
              type="button"
              aria-label={"Remover ingrediente " + (index + 1)}
              disabled={items.length === 1}
              onClick={() => setItems(items.filter((_, j) => j !== index))}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          icon="plus"
          onClick={() => {
            const p = products.find((p) => !items.some((i) => i.id === p.id));
            if (p) setItems([...items, { id: p.id, qty: 1 }]);
          }}
          disabled={items.length >= products.length}
        >
          Adicionar ingrediente
        </Button>
        <div className="notice">
          <Icon name="shield" />
          <span>
            Salvar a ficha não altera o estoque. A capacidade será calculada a
            partir dos ingredientes.
            {localOnly && " A ficha ainda não é gravada no servidor."}
          </span>
        </div>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Salvar ficha técnica</Button>
        </div>
      </form>
    </Modal>
  );
}
