import React from "react";
import { Icon } from "./icon.jsx";

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      <Icon name="check" />
      {message}
      <button aria-label="Fechar mensagem" onClick={onClose}>
        <Icon name="close" size={16} />
      </button>
    </div>
  );
}
