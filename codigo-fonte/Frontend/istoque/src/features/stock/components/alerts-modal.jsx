import React from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { fmt, formatDate } from "@/utils/format.js";

// Linha clicável: fecha o aviso e abre o produto.
function ProductLink({ product, onClose, onOpenProduct, children }) {
  return (
    <button
      className="list-link"
      onClick={() => {
        onClose();
        onOpenProduct(product);
      }}
    >
      {children}
    </button>
  );
}

// Alertas do sino: validade próxima e estoque baixo. demoDate: a data de
// referência da demonstração (com login, null).
export function AlertsModal({ expiring, low, demoDate, onClose, onOpenProduct }) {
  const link = { onClose, onOpenProduct };
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
        <ProductLink key={p.id} product={p} {...link}>
          <span>
            {p.name}
            <small>
              {fmt(p.stock)} {p.unit} disponíveis
            </small>
          </span>
          <Badge tone="warning">{formatDate(p.expiry)}</Badge>
        </ProductLink>
      ))}
      <h3 className="mt">Estoque baixo</h3>
      {low.map((p) => (
        <ProductLink key={p.id} product={p} {...link}>
          <span>{p.name}</span>
          <strong>
            {fmt(p.stock)} {p.unit}
          </strong>
        </ProductLink>
      ))}
    </Modal>
  );
}
