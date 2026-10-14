import React, { useState } from "react";
import { errorMessage } from "@/lib/api-client.js";
import { AuthButton, AuthField } from "./auth-controls.jsx";
import { formFieldErrors } from "../utils/api-fields.js";
import { loginFields, signupFields } from "../utils/fields.js";
import { fieldError } from "../utils/validation.js";

// Erro de um campo do formulário: lê os valores da tela e deixa a regra para
// utils/validation.js.
function checkField(field, form, signup) {
  const input = form.elements.namedItem(field.name);
  return fieldError(field, input.value, {
    signup,
    senha: form.elements.namedItem("senha").value,
    typeMismatch: input.validity.typeMismatch,
  });
}

// onSubmit recebe os valores do formulário e devolve uma promessa; se ela
// falhar, o erro da API aparece no campo certo ou acima do botão.
export function AccessForm({ signup, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const fields = signup ? signupFields : loginFields;
  function showErrors(form, next) {
    setErrors(next);
    const first = fields.find((field) => next[field.name]);
    if (first) form.elements.namedItem(first.name).focus();
    return Boolean(first);
  }
  async function submit(event) {
    event.preventDefault();
    if (sending) return;
    const form = event.currentTarget;
    const next = Object.fromEntries(
      fields
        .map((field) => [field.name, checkField(field, form, signup)])
        .filter(([, error]) => error),
    );
    setFormError("");
    if (showErrors(form, next)) return;
    setSending(true);
    try {
      await onSubmit(Object.fromEntries(new FormData(form)));
    } catch (error) {
      // erro de um campo da tela vai para o campo; o resto, acima do botão
      if (!showErrors(form, formFieldErrors(error.fields)))
        setFormError(errorMessage(error));
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="access-form-panel">
      <div className="access-form-content">
        <h1>{signup ? "Cadastro" : "Login"}</h1>
        <form
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
            const error = checkField(field, event.currentTarget, signup);
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
          {formError && (
            <p className="access-error" role="alert">
              {formError}
            </p>
          )}
          <AuthButton
            type="submit"
            className="access-submit"
            arrow={!signup}
            disabled={sending}
            aria-busy={sending || undefined}
          >
            {sending
              ? signup
                ? "Criando conta..."
                : "Entrando..."
              : signup
                ? "Criar conta"
                : "Entrar"}
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
