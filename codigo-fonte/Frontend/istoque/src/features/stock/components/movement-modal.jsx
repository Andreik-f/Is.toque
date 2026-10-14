import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { fmt } from "@/utils/format.js";
import { MOVEMENT_TYPES, controlsExpiry, moveStock } from "@/utils/inventory.js";

const { entry, exit, loss, adjustment } = MOVEMENT_TYPES;

// Saldo depois da movimentação, ou null se a quantidade (texto do campo) está
// vazia ou é inválida. Campo vazio não vale como 0: no ajuste, 0 é um saldo
// válido e apareceria antes de o usuário digitar.
function balanceAfter(product, type, qty) {
  if (qty === "") return null;
  try {
    return moveStock(product, type, Number(qty)).stock;
  } catch {
    return null;
  }
}

// localOnly: com login, avisa que a movimentação ainda não vai para a API.
export function MovementModal({
  products,
  selected,
  localOnly,
  onClose,
  onSave,
}) {
  const [id, setId] = useState(selected?.id || products[0].id);
  const [type, setType] = useState(entry);
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");
  const p = products.find((p) => p.id === id);
  // a validade é do lote: pedida só na entrada de produto que controla validade
  const askExpiry = type === entry && controlsExpiry(p);
  const after = balanceAfter(p, type, qty);
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
            onSave(id, type, Number(qty), reason.trim(), askExpiry ? expiry : "");
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        <div className="segmented">
          {[entry, exit, loss, adjustment].map((t) => (
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
              type === adjustment
                ? "Saldo correto (" + p.unit + ")"
                : "Quantidade (" + p.unit + ")"
            }
            type="number"
            value={qty}
            min={type === adjustment ? 0 : p.unit === "un" ? 1 : 0.001}
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
        {askExpiry && (
          <Field
            label="Validade do lote"
            type="date"
            value={expiry}
            required
            onChange={(e) => setExpiry(e.target.value)}
            hint="O produto mostra a validade do lote que vence primeiro."
          />
        )}
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
            {after === null
              ? "Quantidade inválida"
              : fmt(after) + " " + p.unit}
          </strong>
        </div>
        {localOnly && (
          <div className="notice">
            <Icon name="alert" />
            <span>
              A movimentação ainda não é gravada no servidor: o saldo volta ao
              anterior quando a página for recarregada.
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
          <Button
            type="submit"
            disabled={
              after === null ||
              !qty ||
              reason.trim().length < 3 ||
              (askExpiry && !expiry)
            }
          >
            Confirmar movimentação
          </Button>
        </div>
      </form>
    </Modal>
  );
}
