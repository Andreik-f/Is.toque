
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { login, signup as signupRequest } from "../api/auth.js";
import mascot from "../assets/mascote.png";
import { AccessForm } from "./access-form.jsx";
import { AuthCurve, AuthPromo } from "./auth-controls.jsx";
import "./auth.css";

// Tela de acesso: login, cadastro e recuperação de senha (#login, #cadastro,
// #recuperar). Login e cadastro chamam a API e entregam a sessão a
// onAuthenticated.
export function AuthScreen({ route, go, onAuthenticated }) {
  const signup = route === "cadastro";
  const [sent, setSent] = useState(false);
  useEffect(() => setSent(false), [route]);
  return (
    <main className={`access-page ${signup ? "is-signup" : "is-login"}`}>
      <AuthCurve signup={signup} />
      <div className="access-card">
        <AuthPromo signup={signup} />
        <div className="access-mascot" aria-hidden="true">
          <img src={mascot} alt="" width="541" height="462" draggable="false" />
        </div>
        <AccessForm
          key={signup ? "signup" : "login"}
          signup={signup}
          onSubmit={async (values) =>
            onAuthenticated(
              await (signup ? signupRequest(values) : login(values)),
            )
          }
        />
      </div>
      {route === "recuperar" && (
        <Modal
          title="Recuperar acesso"
          subtitle="Fluxo proposto — envio de e-mail ainda não integrado."
          onClose={() => go("login")}
        >
          {sent ? (
            <div className="notice" role="status">
              <Icon name="check" />
              <span>Simulação concluída. Nenhum e-mail foi enviado.</span>
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSent(true);
              }}
            >
              <Field
                label="E-mail do usuário"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={150}
                required
              />
              <div className="modal-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => go("login")}
                >
                  Voltar
                </Button>
                <Button type="submit">Simular recuperação</Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </main>
  );
}
