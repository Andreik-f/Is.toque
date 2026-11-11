import React, { useEffect, useRef, useState } from "react";
import { Mascot } from "@/components/ui/mascot.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { mascotFace } from "@/utils/mascot.js";
import { login, signup as signupRequest } from "../api/auth.js";
import { AccessForm } from "./access-form.jsx";
import { AuthCurve, AuthPromo } from "./auth-controls.jsx";
import { PasswordRecovery } from "./password-recovery.jsx";
import "./auth.css";

const NO_ACTIVITY = { focus: null, emailLength: 0, passwordVisible: false };
const sameActivity = (a, b) =>
  a.focus === b.focus &&
  a.emailLength === b.emailLength &&
  a.passwordVisible === b.passwordVisible;

// Tela de acesso: login, cadastro e recuperação de senha (#login, #cadastro,
// #recuperar). Login e cadastro chamam a API e entregam a sessão a
// onAuthenticated; a recuperação abre num modal sobre o login.
export function AuthScreen({ route, go, onAuthenticated, notice }) {
  const signup = route === "cadastro";
  // o que a pessoa está fazendo no formulário, para o olho do mascote
  const [activity, setActivity] = useState(NO_ACTIVITY);
  // login e cadastro são formulários diferentes (o formulário remonta): ao
  // alternar, o olho volta ao centro em vez de herdar o foco do outro
  useEffect(() => setActivity(NO_ACTIVITY), [signup]);
  // o ref do mascote dispara as reações: erro() balança a caixa de cima e
  // sucesso() solta a fita e faz as caixas pularem
  const mascotRef = useRef(null);
  return (
    <main className={`access-page ${signup ? "is-signup" : "is-login"}`}>
      <AuthCurve signup={signup} />
      <div className="access-card">
        <AuthPromo signup={signup} />
        {/* a entrada roda uma vez ao montar: alternar login e cadastro não
            desmonta esta tela, então o mascote não repete */}
        <div className="access-mascot" aria-hidden="true">
          <Mascot
            ref={mascotRef}
            variant="duas"
            mode="entrada"
            face={mascotFace(activity, "duas")}
          />
        </div>
        <AccessForm
          key={signup ? "signup" : "login"}
          signup={signup}
          // cada digitação avisa, mas só muda o estado (e redesenha a tela)
          // quando algo da atividade mudou; o tamanho do e-mail conta cru,
          // então depois dos 22 caracteres ainda redesenha a cada tecla
          onActivity={(next) =>
            setActivity((previous) =>
              sameActivity(previous, next) ? previous : next,
            )
          }
          onSubmit={(values) =>
            signup ? signupRequest(values) : login(values)
          }
          // entra no sistema só depois do mascote comemorar; com reduzir
          // movimento a promessa resolve na hora e entra sem esperar
          onSuccess={async (session) => {
            await mascotRef.current?.sucesso();
            onAuthenticated(session);
          }}
          notice={notice}
          onFail={() => mascotRef.current?.erro()}
        />
      </div>
      {route === "recuperar" && (
        <Modal
          title="Recuperar acesso"
          subtitle="O código chega por SMS ao administrador da empresa."
          onClose={() => go("login")}
        >
          <PasswordRecovery onDone={() => go("login")} />
        </Modal>
      )}
    </main>
  );
}
