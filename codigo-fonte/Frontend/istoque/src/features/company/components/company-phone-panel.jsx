import React, { useState } from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { useCountdown } from "@/hooks/use-countdown.js";
import { errorMessage } from "@/lib/api-client.js";
import { useUiStore } from "@/stores/ui-store.jsx";
import {
  mascararTelefone,
  mesmoTelefone,
  telefoneParaExibir,
  telefoneValido,
} from "@/utils/phone.js";
import {
  SEGUNDOS_ENTRE_CODIGOS,
  erroDoCodigo,
  pedidoBloqueado,
  rotuloDoReenvio,
} from "@/utils/sms-code.js";
import {
  confirmPhoneCode,
  saveCompanyPhone,
  sendPhoneCode,
} from "../api/company.js";
import { telefoneConfirmado } from "../utils/company-api.js";
import { UnconfirmedPhoneNotice } from "./phone-notice.jsx";

// initial é a empresa já carregada (GET /api/empresas/minha). O painel edita só
// o telefone; o resto da empresa é reenviado como está (ver companyToApi).
export function CompanyPhonePanel({ initial }) {
  const { notify } = useUiStore();
  const { restante, iniciar } = useCountdown();
  const [empresa, setEmpresa] = useState(initial);
  const [telefone, setTelefone] = useState(
    telefoneParaExibir(initial.telefone),
  );
  const [codigo, setCodigo] = useState("");
  const [codigoAberto, setCodigoAberto] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [sendError, setSendError] = useState("");
  const [codeError, setCodeError] = useState("");

  const confirmado = telefoneConfirmado(empresa);
  const alterado = !mesmoTelefone(telefone, empresa.telefone ?? "");

  // Roda a ação com o painel travado; a mensagem de erro vai para onde `onError`
  // mandar.
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

  function salvar(event) {
    event.preventDefault();
    if (telefone.trim() && !telefoneValido(telefone))
      return setPhoneError("O telefone informado é inválido.");
    setPhoneError("");
    setSendError("");
    run(
      async () => {
        const atualizada = await saveCompanyPhone(telefone);
        setEmpresa(atualizada);
        setTelefone(telefoneParaExibir(atualizada.telefone));
        // trocar o número invalida os códigos pendentes; a contagem segue,
        // porque o limite de pedidos é da empresa e não do número
        setCodigo("");
        setCodigoAberto(false);
        notify("Telefone salvo.");
      },
      (error) => setPhoneError(errorMessage(error)),
    );
  }

  function enviarCodigo() {
    setSendError("");
    setCodeError("");
    run(
      async () => {
        await sendPhoneCode();
        setCodigo("");
        setCodigoAberto(true);
        iniciar(SEGUNDOS_ENTRE_CODIGOS);
      },
      (error) => {
        setSendError(errorMessage(error));
        // bloqueado: pode haver um código válido de antes (página recarregada)
        if (pedidoBloqueado(error)) setCodigoAberto(true);
      },
    );
  }

  function confirmar(event) {
    event.preventDefault();
    setCodeError("");
    run(
      async () => {
        await confirmPhoneCode(codigo);
        // o 204 não traz dados e a tela só olha se a data existe: marcar aqui
        // evita uma segunda requisição que, se falhasse, mostraria erro para
        // um telefone que já foi confirmado
        setEmpresa((atual) => ({
          ...atual,
          telefoneVerificadoEm: new Date().toISOString(),
        }));
        setCodigoAberto(false);
        notify("Telefone confirmado.");
      },
      (error) => {
        setCodeError(erroDoCodigo(error));
        setCodigo("");
      },
    );
  }

  return (
    <section className="panel company-phone">
      <div className="panel-heading">
        <div>
          <h2>Telefone da empresa</h2>
          <p>
            Recebe o código da recuperação de senha por SMS. Só celular recebe o
            código.
          </p>
        </div>
        <Badge tone={confirmado ? "success" : "warning"}>
          {confirmado ? "Confirmado" : "Não confirmado"}
        </Badge>
      </div>
      <div className="company-phone-body">
        {!confirmado && <UnconfirmedPhoneNotice />}
        <form className="company-phone-form" onSubmit={salvar} noValidate>
          <Field
            label="Telefone da empresa"
            name="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            value={telefone}
            onChange={(event) => {
              setTelefone(mascararTelefone(event.target.value));
              setPhoneError("");
            }}
            aria-invalid={phoneError ? true : undefined}
            aria-describedby={phoneError ? "company-phone-error" : undefined}
            hint={
              confirmado && alterado
                ? "Ao trocar o telefone, será preciso confirmar de novo."
                : "Com DDD, ou com + e o código do país."
            }
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={!alterado || busy}
          >
            Salvar telefone
          </Button>
        </form>
        {phoneError && (
          <p className="error-text" id="company-phone-error" role="alert">
            {phoneError}
          </p>
        )}

        {!confirmado && (
          <div className="company-phone-send">
            {empresa.telefone ? (
              <Button
                type="button"
                disabled={alterado || busy || restante > 0}
                onClick={enviarCodigo}
              >
                {restante > 0 || codigoAberto
                  ? rotuloDoReenvio(restante)
                  : "Enviar código"}
              </Button>
            ) : (
              <small>Salve o telefone para receber o código.</small>
            )}
            {sendError && (
              <p className="error-text" role="alert">
                {sendError}
              </p>
            )}
          </div>
        )}

        {!confirmado && codigoAberto && (
          <form className="company-phone-code" onSubmit={confirmar} noValidate>
            <Field
              label="Código recebido por SMS"
              name="codigo"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(event) => {
                setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6));
                setCodeError("");
              }}
              aria-invalid={codeError ? true : undefined}
              aria-describedby={codeError ? "company-code-error" : undefined}
              hint="6 dígitos. O código vale por 10 minutos."
            />
            <Button type="submit" disabled={codigo.length < 6 || busy}>
              Confirmar telefone
            </Button>
            {codeError && (
              <p className="error-text" id="company-code-error" role="alert">
                {codeError}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
