import React from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { fmt, formatDate } from "@/utils/format.js";

// Alertas do sino: validade próxima e estoque baixo. demoDate: a data de
// referência da demonstração (com login, null).
export function AlertsModal({ expiring, low, demoDate, onClose, onOpenProduct }) {
  return (
    <Modal
      title="Sua cozinha pede atenção"
      subtitle={
        demoDate
          ? `Validade calculada a partir de ${demoDate} na demonstração.`
          : "Validade calculada a partir de hoje."
      }
      onClose={onClose}
    >
      <h3>Validade em até 3 dias</h3>
      {expiring.map((p) => (
        <button
          className="list-link"
          key={p.id}
          onClick={() => {
            onClose();
            onOpenProduct(p);
          }}
        >
          <span>
            {p.name}
            <small>
              {fmt(p.stock)} {p.unit} disponíveis
            </small>
          </span>
          <Badge tone="warning">{formatDate(p.expiry)}</Badge>
        </button>
      ))}
      <h3 className="mt">Estoque baixo</h3>
      {low.map((p) => (
        <button
          className="list-link"
          key={p.id}
          onClick={() => {
            onClose();
            onOpenProduct(p);
          }}
        >
          <span>{p.name}</span>
          <strong>
            {fmt(p.stock)} {p.unit}
          </strong>
        </button>
      ))}
    </Modal>
  );
}
