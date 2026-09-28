import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { fmt } from "@/utils/format.js";
import { moveStock } from "@/utils/inventory.js";

export function MovementModal({ products, selected, onClose, onSave }) {
  const [id, setId] = useState(selected?.id || products[0].id),
    [type, setType] = useState("Entrada"),
    [qty, setQty] = useState(""),
    [reason, setReason] = useState(""),
    [error, setError] = useState("");
  const p = products.find((p) => p.id === id);
  let after;
  try {
    after = moveStock(p, type, Number(qty)).stock;
  } catch {}
  return (
    <Modal
      title="Movimentar estoque"
      subtitle="Registre o que entrou, saiu ou precisou ser corrigido."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            onSave(id, type, Number(qty), reason.trim());
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="segmented">
          {["Entrada", "Saída", "Perda", "Ajuste"].map((t) => (
            <button
              type="button"
              className={type === t ? "selected" : ""}
              onClick={() => {
                setType(t);
                setError("");
              }}
              key={t}
            >
              {t}
            </button>
          ))}
        </div>
        <Field label="Ingrediente">
          <select value={id} onChange={(e) => setId(e.target.value)}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.unit})
              </option>
            ))}
          </select>
        </Field>
        <div className="form-grid">
          <Field
            label={
              type === "Ajuste"
                ? "Saldo correto (" + p.unit + ")"
                : "Quantidade (" + p.unit + ")"
            }
            type="number"
            value={qty}
            min={type === "Ajuste" ? 0 : p.unit === "un" ? 1 : 0.001}
            step={p.unit === "un" ? 1 : 0.001}
            required
            onChange={(e) => {
              setQty(e.target.value);
              setError("");
            }}
          />
          <div className="balance">
            <span>Saldo atual</span>
            <strong>
              {fmt(p.stock)} {p.unit}
            </strong>
          </div>
        </div>
        <Field
          label="Motivo / observação"
          hint="O motivo ficará visível no histórico."
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={3}
            placeholder="Ex.: recebimento da compra semanal"
          />
        </Field>
        <div className="new-balance">
          <span>Saldo após a movimentação</span>
          <strong>
            {after === undefined
              ? "Quantidade inválida"
              : fmt(after) + " " + p.unit}
          </strong>
        </div>
        {error && (
          <p className="error-text" role="alert">
            {error}
          </p>
        )}
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={after === undefined || !qty || reason.trim().length < 3}
          >
            Confirmar movimentação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
