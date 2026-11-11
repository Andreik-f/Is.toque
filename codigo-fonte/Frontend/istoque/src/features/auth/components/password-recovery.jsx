import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { useCountdown } from "@/hooks/use-countdown.js";
import { errorMessage } from "@/lib/api-client.js";
import {
  SEGUNDOS_ENTRE_CODIGOS,
  pedidoBloqueado,
  rotuloDoReenvio,
} from "@/utils/sms-code.js";
import { requestRecoveryCode, resetPassword } from "../api/auth.js";
import {
  AVISO_DO_PEDIDO,
  CAMPOS_DA_TROCA,
  CAMPOS_DO_PEDIDO,
  SENHA_ALTERADA,
  recoveryErrors,
  resetErrors,
} from "../utils/recovery.js";

const errorId = (name) => `recovery-${name}-error`;

// Conteúdo do modal de #recuperar, em três passos: "pedido" (e-mail), "codigo"
// (código que o administrador repassa e a nova senha) e "feito". onDone volta
// para o login.
export function PasswordRecovery({ onDone }) {
  const { restante, iniciar } = useCountdown();
  const [step, setStep] = useState("pedido");
  const [values, setValues] = useState({
    email: "",
    codigo: "",
    novaSenha: "",
    confirmacao: "",
  });
  const [errors, setErrors] = useState({});
  const [sendError, setSendError] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const codigoRef = useRef(null);

  function change(name, value) {
    setValues((previous) => ({ ...previous, [name]: value }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      if (name === "novaSenha") delete next.confirmacao;
      return next;
    });
  }

  // Mostra os erros e leva o foco ao primeiro campo com erro. Devolve se havia
  // algum.
  function showErrors(form, next) {
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) form.elements.namedItem(first)?.focus();
    return Boolean(first);
  }

  async function run(action, onError) {
    if (busy) return;
    setBusy(true);
    try {
      await action();
    } catch (error) {
      onError(error);
    } finally {
      setBusy(false);
    }
  }

  // Serve ao primeiro pedido e ao reenvio.
  function pedirCodigo() {
    setSendError("");
    run(
      async () => {
        await requestRecoveryCode(values.email);
        // um novo pedido aposenta o código anterior
        change("codigo", "");
        setStep("codigo");
        iniciar(SEGUNDOS_ENTRE_CODIGOS);
        // no reenvio o botão clicado fica desabilitado pela contagem: o foco
        // vai para onde o código novo é digitado (no primeiro pedido o campo
        // ainda não existe e recebe o foco ao montar)
        codigoRef.current?.focus();
      },
      (error) => {
        setSendError(errorMessage(error));
        // bloqueado: pode haver um código válido de um pedido anterior
        if (pedidoBloqueado(error)) setStep("codigo");
      },
    );
  }

  function enviarEmail(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const next = recoveryErrors(CAMPOS_DO_PEDIDO, values, {
      typeMismatch: form.elements.namedItem("email").validity.typeMismatch,
    });
    if (!showErrors(form, next)) pedirCodigo();
  }

  function trocarSenha(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormError("");
    if (showErrors(form, recoveryErrors(CAMPOS_DA_TROCA, values))) return;
    run(
      async () => {
        await resetPassword(values);
        setStep("feito");
      },
      (error) => {
        const { fields, form: message } = resetErrors(error);
        if (fields.codigo)
          setValues((previous) => ({ ...previous, codigo: "" }));
        showErrors(form, fields);
        setFormError(message);
      },
    );
  }

  const fieldProps = (name) => ({
    name,
    value: values[name],
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? errorId(name) : undefined,
  });
  const fieldErrorText = (name) =>
    errors[name] && (
      <p className="error-text" id={errorId(name)} role="alert">
        {errors[name]}
      </p>
    );

  if (step === "feito")
    return (
      <div className="recovery-form">
        <div className="notice" role="status">
          <Icon name="check" />
          <span>{SENHA_ALTERADA}</span>
        </div>
        <div className="modal-actions">
          <Button type="button" autoFocus onClick={onDone}>
            Voltar ao login
          </Button>
        </div>
      </div>
    );

  if (step === "codigo")
    return (
      <form className="recovery-form" onSubmit={trocarSenha} noValidate>
        <div className="notice" role="status">
          <Icon name="shield" />
          <span>{AVISO_DO_PEDIDO}</span>
        </div>
        <Field
          label="Código recebido por SMS"
          ref={codigoRef}
          {...fieldProps("codigo")}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          autoFocus
          onChange={(event) =>
            change("codigo", event.target.value.replace(/\D/g, "").slice(0, 6))
          }
          hint="6 dígitos. O código vale por 10 minutos."
        />
        {fieldErrorText("codigo")}
        <div className="recovery-resend">
          <Button
            type="button"
            variant="secondary"
            disabled={busy || restante > 0}
            onClick={pedirCodigo}
          >
            {rotuloDoReenvio(restante)}
          </Button>
          {sendError && (
            <p className="error-text" role="alert">
              {sendError}
            </p>
          )}
        </div>
        {/* invisível: é por ele que o gerenciador de senhas do navegador sabe
            de qual conta é a senha nova */}
        <input
          type="email"
          value={values.email}
          autoComplete="username"
          readOnly
          hidden
        />
        <Field
          label="Nova senha"
          {...fieldProps("novaSenha")}
          type="password"
          autoComplete="new-password"
          onChange={(event) => change("novaSenha", event.target.value)}
          hint="Mínimo de 8 caracteres."
        />
        {fieldErrorText("novaSenha")}
        <Field
          label="Confirmar nova senha"
          {...fieldProps("confirmacao")}
          type="password"
          autoComplete="new-password"
          onChange={(event) => change("confirmacao", event.target.value)}
        />
        {fieldErrorText("confirmacao")}
        {formError && (
          <p className="error-text" role="alert">
            {formError}
          </p>
        )}
        <div className="modal-actions">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setErrors({});
              setSendError("");
              setFormError("");
              setStep("pedido");
            }}
          >
            Voltar
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Salvando..." : "Salvar nova senha"}
          </Button>
        </div>
      </form>
    );

  return (
    <form className="recovery-form" onSubmit={enviarEmail} noValidate>
      <Field
        label="E-mail do usuário"
        {...fieldProps("email")}
        type="email"
        autoComplete="username"
        maxLength={150}
        onChange={(event) => change("email", event.target.value)}
      />
      {fieldErrorText("email")}
      {sendError && (
        <p className="error-text" role="alert">
          {sendError}
        </p>
      )}
      <div className="modal-actions">
        <Button type="button" variant="ghost" onClick={onDone}>
          Voltar
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Enviando..." : "Enviar código"}
        </Button>
      </div>
    </form>
  );
}
