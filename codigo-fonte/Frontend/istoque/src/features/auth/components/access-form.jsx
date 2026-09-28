import React, { useRef, useState } from "react";
import { AuthButton, AuthField } from "./auth-controls.jsx";

// Field mappings follow the supplied data model. No API contract is assumed.
const signupFields = [
  {
    name: "razao_social",
    label: "Razão social",
    placeholder: "Nome registrado da empresa",
    icon: "box",
    autoComplete: "organization",
    maxLength: 150,
  },
  {
    name: "nome",
    label: "Nome do responsável",
    placeholder: "Seu nome completo",
    icon: "users",
    autoComplete: "name",
    maxLength: 120,
  },
  {
    name: "email",
    label: "E-mail do usuário",
    placeholder: "voce@exemplo.com",
    icon: "mail",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    placeholder: "Digite sua senha",
    icon: "lock",
    type: "password",
    autoComplete: "new-password",
  },
  {
    name: "confirmacao",
    label: "Confirmar senha",
    placeholder: "Repita sua senha",
    icon: "lock",
    type: "password",
    autoComplete: "new-password",
  },
];
const loginFields = [
  {
    name: "email",
    label: "E-mail do usuário",
    placeholder: "voce@exemplo.com",
    icon: "mail",
    type: "email",
    autoComplete: "username",
    maxLength: 150,
  },
  {
    name: "senha",
    label: "Senha",
    placeholder: "Digite sua senha",
    icon: "lock",
    type: "password",
    autoComplete: "current-password",
  },
];

export function AccessForm({ signup, onComplete }) {
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const fields = signup ? signupFields : loginFields;
  function fieldError(field, form) {
    const input = form.elements.namedItem(field.name);
    const value = input.value;
    if (
      !value ||
      (["nome", "razao_social"].includes(field.name) && !value.trim())
    ) {
      return {
        razao_social: "Informe a razão social.",
        nome: "Informe o nome do responsável.",
        email: "Informe seu e-mail.",
        senha: "Informe sua senha.",
        confirmacao: "Confirme sua senha.",
      }[field.name];
    }
    if (field.type === "email" && input.validity.typeMismatch)
      return "Digite um e-mail válido.";
    if (
      field.name === "confirmacao" &&
      value !== form.elements.namedItem("senha").value
    )
      return "As senhas precisam ser iguais.";
    return "";
  }
  function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const next = Object.fromEntries(
      fields
        .map((field) => [field.name, fieldError(field, form)])
        .filter(([, error]) => error),
    );
    setErrors(next);
    const first = fields.find((field) => next[field.name]);
    if (first) {
      form.elements.namedItem(first.name).focus();
      return;
    }
    // Demo only: do not persist or transmit credentials.
    onComplete();
  }
  return (
    <section className="access-form-panel">
      <div className="access-form-content">
        <h1>{signup ? "Cadastro" : "Login"}</h1>
        <form
          ref={formRef}
          onSubmit={submit}
          noValidate
          aria-label={signup ? "Cadastro básico" : "Login"}
          onInput={(event) => {
            const name = event.target.name;
            setErrors((previous) => {
              const next = { ...previous };
              delete next[name];
              if (name === "senha") delete next.confirmacao;
              return next;
            });
          }}
          onBlur={(event) => {
            const field = fields.find((f) => f.name === event.target.name);
            if (!field) return;
            const error = fieldError(field, event.currentTarget);
            setErrors((previous) => ({ ...previous, [field.name]: error }));
          }}
        >
          <div className="access-fields">
            {fields.map((field) => (
              <AuthField
                key={field.name}
                {...field}
                required
                error={errors[field.name]}
              />
            ))}
          </div>
          {!signup && (
            <a className="access-forgot" href="#recuperar">
              Esqueceu a senha?
            </a>
          )}
          <AuthButton type="submit" className="access-submit" arrow={!signup}>
            {signup ? "Criar conta" : "Entrar"}
          </AuthButton>
        </form>
        <p className="access-mobile-switch">
          {signup ? (
            <>
              Já tem uma conta? <a href="#login">Entrar</a>
            </>
          ) : (
            <>
              Ainda não tem uma conta? <a href="#cadastro">Cadastre-se</a>
            </>
          )}
        </p>
      </div>
    </section>
  );
}
