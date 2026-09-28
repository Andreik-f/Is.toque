import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { fmt, round } from "@/utils/format.js";
import { capacity } from "@/utils/inventory.js";

export function ProductionModal({ recipe, products, onClose, onConfirm }) {
  const [qty, setQty] = useState(5),
    [step, setStep] = useState("review"),
    [error, setError] = useState("");
  const cap = capacity(recipe, products),
    valid = Number.isInteger(qty) && qty > 0 && qty <= cap;
  const initialCap = React.useRef(cap);
  return (
    <Modal
      wide
      title={step === "success" ? "Produção registrada!" : "Registrar produção"}
      subtitle={
        step === "success"
          ? "O consumo foi lançado no histórico e as capacidades foram recalculadas."
          : recipe.name + " • revise o consumo antes de confirmar."
      }
      onClose={onClose}
    >
      {step === "success" ? (
        <div className="success-state">
          <span className="success-icon">
            <Icon name="check" size={38} />
          </span>
          <h3>{qty} porções prontas para o próximo passo.</h3>
          <p>Capacidade restante desta receita</p>
          <strong className="success-number">
            {cap} <small>porções</small>
          </strong>
          <div className="notice">
            <Icon name="shield" />
            <span>
              Os {recipe.ingredients.length} ingredientes foram baixados juntos
              nesta demonstração.
            </span>
          </div>
          <Button onClick={onClose}>Concluir</Button>
        </div>
      ) : (
        <>
          <div className="quantity-row">
            <Field
              label="Quantidade a produzir"
              hint="Apenas porções inteiras."
            >
              <input
                aria-label="Quantidade a produzir"
                type="number"
                min="1"
                step="1"
                value={qty}
                onChange={(e) => {
                  setQty(Number(e.target.value));
                  setError("");
                }}
              />
            </Field>
            <div className="available">
              <span>Disponível agora</span>
              <strong>{initialCap.current} porções</strong>
            </div>
          </div>
          {!valid && (
            <div className="notice danger" role="alert">
              <Icon name="alert" />
              <span>
                {qty > cap
                  ? `Estoque insuficiente. Você pode produzir até ${cap} porções.`
                  : "Informe uma quantidade inteira maior que zero."}
              </span>
            </div>
          )}
          <h3 className="review-title">Consumo previsto</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Consumir</th>
                  <th>Saldo depois</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((i) => {
                  const p = products.find((p) => p.id === i.id),
                    after = round(p.stock - i.qty * qty);
                  return (
                    <tr key={i.id}>
                      <td>
                        <strong>{p.name}</strong>
                        <small>
                          {fmt(i.qty)} {p.unit} por porção
                        </small>
                      </td>
                      <td>
                        {fmt(i.qty * qty)} {p.unit}
                      </td>
                      <td className={after < 0 ? "error-text" : ""}>
                        {fmt(after)} {p.unit}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="notice">
            <Icon name="shield" />
            <span>
              A confirmação baixa todos os ingredientes e registra David Rocha
              como responsável.
            </span>
          </div>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div className="modal-actions">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="accent"
              disabled={!valid}
              icon="check"
              onClick={() => {
                try {
                  onConfirm(qty);
                  setStep("success");
                } catch (e) {
                  setError(e.message);
                }
              }}
            >
              Confirmar produção
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
