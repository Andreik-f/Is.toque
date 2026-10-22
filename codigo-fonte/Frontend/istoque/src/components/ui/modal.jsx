import React, { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion.js";
import { Icon } from "./icon.jsx";

// A saída dura --dur-fast (150 ms); este prazo é só a folga para o caso de o
// animationend não chegar (aba em segundo plano, por exemplo).
const CLOSE_FALLBACK_MS = 200;

export function Modal({ title, subtitle, children, onClose, wide = false }) {
  const ref = useRef();
  const [closing, setClosing] = useState(false);
  const timer = useRef();
  const requested = useRef(false);
  const finished = useRef(false);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current.showModal();
    return () => {
      // o pai pode desmontar o modal antes do prazo; sem isto o onClose
      // rodaria depois
      clearTimeout(timer.current);
      prev?.focus();
    };
  }, []);

  // O animationend e o prazo de segurança podem chegar os dois: o onClose
  // (que desmonta o modal) só pode rodar uma vez.
  function finish() {
    if (finished.current) return;
    finished.current = true;
    clearTimeout(timer.current);
    onClose();
  }

  // X, Esc e clique fora passam por aqui. Toca a saída (classe closing) e só
  // chama o onClose no fim dela, senão o modal sumiria antes de animar.
  function requestClose() {
    if (requested.current) return;
    requested.current = true;
    // com movimento reduzido o CSS tira a animação e o animationend não vem
    if (prefersReducedMotion()) return finish();
    setClosing(true);
    timer.current = setTimeout(finish, CLOSE_FALLBACK_MS);
  }

  return (
    <dialog
      ref={ref}
      className={`modal${wide ? " wide" : ""}${closing ? " closing" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) requestClose();
      }}
      onAnimationEnd={(e) => {
        // o evento também chega dos filhos (como o error-in) e do ::backdrop,
        // então só vale o fim da saída do próprio dialog
        if (e.target === e.currentTarget && e.animationName === "modal-out")
          finish();
      }}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">ISTOQUE / OPERAÇÃO</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button
          className="icon-button"
          aria-label="Fechar"
          onClick={requestClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
