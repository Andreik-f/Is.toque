import React, { useRef, useState } from "react";
import { errorMessage } from "@/lib/api-client.js";
import { AuthButton, AuthField } from "./auth-controls.jsx";
import { formFieldErrors } from "../utils/api-fields.js";
import { cnpjValido, SENHA_MINIMA } from "../utils/validation.js";

// Os campos seguem o contrato da API: POST /api/auth/login (e-mail e senha)
// e POST /api/auth/cadastro (empresa e administrador juntos).
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
    name: "cnpj",
    label: "CNPJ",
    placeholder: "00.000.000/0000-00",
    icon: "box",
    maxLength: 18,
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

// onSubmit recebe os valores do formulário e devolve uma promessa; se ela
// falhar, o erro da API aparece no campo certo ou acima do botão.
export function AccessForm({ signup, onSubmit }) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
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
        cnpj: "Informe o CNPJ.",
        nome: "Informe o nome do responsável.",
        email: "Informe seu e-mail.",
        senha: "Informe sua senha.",
        confirmacao: "Confirme sua senha.",
      }[field.name];
    }
    if (field.name === "cnpj" && !cnpjValido(value))
      return "O CNPJ deve ter 14 caracteres, com ou sem máscara.";
    if (field.type === "email" && input.validity.typeMismatch)
      return "Digite um e-mail válido.";
    if (signup && field.name === "senha" && value.length < SENHA_MINIMA)
      return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`;
    if (
      field.name === "confirmacao" &&
      value !== form.elements.namedItem("senha").value
    )
      return "As senhas precisam ser iguais.";
    return "";
  }
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
        .map((field) => [field.name, fieldError(field, form)])
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
