import React, { useEffect, useRef, useState } from "react";
import { errorMessage } from "@/lib/api-client.js";
import { playAnimation } from "@/lib/motion.js";
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

// Campo a que um elemento do formulário pertence. O botão de mostrar senha, que
// não tem name, conta como o campo dele: é isso que decide para onde o mascote
// olha, e clicar no botão não pode tirar o olho do campo da senha.
function fieldOf(element) {
  return (
    element?.closest?.(".access-field")?.querySelector("input")?.name ?? null
  );
}

// A caixa do campo balança 3px para os lados, uma vez. Só no envio: no blur ela
// balançaria toda vez que a pessoa saísse do campo com Tab.
function shake(input) {
  return playAnimation(
    input.closest(".access-control"),
    [
      { translate: "0 0" },
      { translate: "-3px 0", offset: 0.25 },
      { translate: "3px 0", offset: 0.6 },
      { translate: "-1px 0", offset: 0.85 },
      { translate: "0 0" },
    ],
    { duration: 240, easing: "ease-in-out" },
  );
}

// onSubmit recebe os valores do formulário e devolve uma promessa só com a
// requisição; se ela falhar, o erro da API aparece no campo certo ou acima do
// botão. Se der certo, onSuccess recebe o resultado e pode demorar (o mascote
// comemora antes de entrar no sistema). onFail avisa de cada tentativa que
// terminou em erro, seja da tela ou da API. onActivity recebe
// { focus, emailLength, passwordVisible } a cada foco, saída de foco e
// digitação, para o mascote acompanhar o preenchimento.
export function AccessForm({
  signup,
  onSubmit,
  onSuccess,
  onFail,
  onActivity,
  notice,
}) {
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  // barra de progresso do botão: idle → running (requisição no ar) → done
  // (respondeu) ou failed (recusada)
  const [progress, setProgress] = useState("idle");
  // depois do fade do erro (150 ms) a barra volta a zero para a próxima
  // tentativa; se a pessoa reenviar antes, o efeito é desfeito
  useEffect(() => {
    if (progress !== "failed") return;
    const timer = setTimeout(() => setProgress("idle"), 200);
    return () => clearTimeout(timer);
  }, [progress]);
  const formRef = useRef(null);
  // senha visível por campo: o cadastro tem duas (senha e confirmação)
  const visibleFields = useRef({});
  const fields = signup ? signupFields : loginFields;
  function report(focus) {
    onActivity?.({
      focus,
      emailLength:
        formRef.current.elements.namedItem("email")?.value.length ?? 0,
      passwordVisible: Object.values(visibleFields.current).some(Boolean),
    });
  }
  // só o envio chama isto (o blur valida por conta própria), então é aqui que
  // os campos com erro balançam
  function showErrors(form, next) {
    setErrors(next);
    const first = fields.find((field) => next[field.name]);
    if (first) {
      form.elements.namedItem(first.name).focus();
      for (const field of fields)
        if (next[field.name]) shake(form.elements.namedItem(field.name));
    }
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
    if (showErrors(form, next)) {
      onFail?.();
      return;
    }
    setSending(true);
    setProgress("running");
    let result;
    try {
      result = await onSubmit(Object.fromEntries(new FormData(form)));
    } catch (error) {
      // erro de um campo da tela vai para o campo; o resto, acima do botão
      if (!showErrors(form, formFieldErrors(error.fields)))
        setFormError(errorMessage(error));
      setProgress("failed");
      onFail?.();
      setSending(false);
      return;
    }
    setProgress("done");
    // fora do try de propósito: um erro da comemoração ou da navegação não é
    // erro de login e não pode virar mensagem de erro nem inclinar o mascote
    try {
      await onSuccess?.(result);
    } finally {
      setSending(false);
    }
  }
  return (
    <section className="access-form-panel">
      <div className="access-form-content">
        {/* Entrada em sequência: o título, cada campo, o link e o botão sobem
            um depois do outro (--i é a posição; o CSS espera 60 ms por item) */}
        <h1 className="access-rise" style={{ "--i": 0 }}>
          {signup ? "Cadastro" : "Login"}
        </h1>
        <form
          ref={formRef}
          onSubmit={submit}
          noValidate
          aria-label={signup ? "Cadastro básico" : "Login"}
          onFocus={(event) => report(fieldOf(event.target))}
          onInput={(event) => {
            const name = event.target.name;
            setErrors((previous) => {
              const next = { ...previous };
              delete next[name];
              if (name === "senha") delete next.confirmacao;
              return next;
            });
            report(fieldOf(event.target));
          }}
          onBlur={(event) => {
            // quem recebe o foco (relatedTarget) já entra aqui, senão o olho
            // voltaria ao centro por um instante ao pular de um campo para outro
            report(fieldOf(event.relatedTarget));
            const field = fields.find((f) => f.name === event.target.name);
            if (!field) return;
            const error = checkField(field, event.currentTarget, signup);
            setErrors((previous) => ({ ...previous, [field.name]: error }));
          }}
        >
          <div className="access-fields">
            {fields.map((field, position) => (
              <AuthField
                key={field.name}
                {...field}
                index={position + 1}
                required
                error={errors[field.name]}
                onVisibleChange={(visible) => {
                  visibleFields.current[field.name] = visible;
                  report(field.name);
                }}
              />
            ))}
          </div>
          {!signup && (
            <a
              className="access-forgot access-rise"
              style={{ "--i": fields.length + 1 }}
              href="#recuperar"
            >
              Esqueceu a senha?
            </a>
          )}
          {notice && !signup && !formError && (
            <p className="access-error" role="alert">
              {notice}
            </p>
          )}
          {formError && (
            <p className="access-error" role="alert">
              {formError}
            </p>
          )}
          <AuthButton
            type="submit"
            className="access-submit access-rise"
            style={{ "--i": fields.length + (signup ? 1 : 2) }}
            arrow={!signup}
            disabled={sending}
            aria-busy={sending || undefined}
            progress={progress}
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
