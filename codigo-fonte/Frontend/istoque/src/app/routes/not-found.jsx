import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Mascot } from "@/components/ui/mascot.jsx";
import { navigate } from "@/hooks/use-hash-route.js";

export function NotFoundRoute({ address }) {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <div className="not-found-copy">
        <span className="eyebrow">ERRO 404</span>
        <h1 id="not-found-title">Essa prateleira está vazia.</h1>
        <p>
          Não encontramos a página <code>{address}</code>.
          <br />
          O endereço pode ter mudado ou ter sido digitado errado.
        </p>
        <div className="not-found-actions">
          <Button
            variant="accent"
            icon="home"
            onClick={() => navigate("dashboard")}
          >
            Voltar à visão geral
          </Button>
          <Button
            variant="secondary"
            icon="box"
            onClick={() => navigate("estoque")}
          >
            Ir para o estoque
          </Button>
        </div>
      </div>
      <div className="not-found-art" aria-hidden="true">
        <div className="not-found-circle" />
        <span className="not-found-code">404</span>
        <Mascot variant="uma" mode="vazio" />
        <div className="floating-label">
          <Icon name="search" size={18} />
          Página não encontrada
        </div>
      </div>
    </section>
  );
}
