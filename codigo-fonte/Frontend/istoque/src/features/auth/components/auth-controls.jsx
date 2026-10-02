import React, { useId, useState } from "react";
import { Icon } from "@/components/ui/icon.jsx";

export function AuthField({ label, error, type = "text", ...props }) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const password = type === "password";
  return (
    <div className="access-field" data-invalid={error ? "true" : undefined}>
      <label className="access-field-label" htmlFor={id}>
        {label}
      </label>
      <div className="access-control">
        <input
          {...props}
          id={id}
          type={password && visible ? "text" : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {password && (
          <button
            type="button"
            className="access-password-toggle"
            aria-label={`${visible ? "Ocultar" : "Mostrar"}: ${label.toLowerCase()}`}
            aria-pressed={visible}
            onClick={() => setVisible((v) => !v)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
              {visible && <path d="m3 3 18 18" />}
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="access-field-error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthButton({
  children,
  href,
  arrow = false,
  className = "",
  ...props
}) {
  const Tag = href ? "a" : "button";
  return (
    <Tag className={`access-button ${className}`} href={href} {...props}>
      <span>{children}</span>
      {arrow && <Icon name="arrow" size={16} />}
    </Tag>
  );
}

export function AuthPromo({ signup }) {
  return (
    <aside className="access-promo">
      <div className="access-promo-copy">
        <p>
          {signup
            ? "A sua empresa já tem uma conta?"
            : "A sua empresa ainda não tem uma conta?"}
        </p>
        <p>{signup ? "entre agora." : "cadastre-se agora"}</p>
      </div>
      <AuthButton href={signup ? "#login" : "#cadastro"} arrow>
        {signup ? "Entrar" : "Começar Grátis"}
      </AuthButton>
    </aside>
  );
}

// Curva decorativa ao lado do cartão de acesso, escondida dos leitores de tela.
export function AuthCurve({ signup }) {
  return (
    <svg
      className="access-curve"
      viewBox={signup ? "0 0 300 900" : "0 0 240 900"}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={
          signup
            ? "M0 0H110C-100 360 210 530 300 900H0Z"
            : "M53 0H240V900H5C107 815 126 623 143 499C166 330 52 141 53 0Z"
        }
        fill="currentColor"
      />
    </svg>
  );
}
