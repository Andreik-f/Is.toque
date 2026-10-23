import React from "react";
import { CtaSilhouettes } from "./decor-silhouettes.jsx";
import { StackedBoxes } from "./landing-mascot.jsx";

export function FinalCta() {
  return (
    <section aria-labelledby="landing-titulo-cta" className="landing-cta">
      <CtaSilhouettes />
      <div className="landing-cta-inner">
        <div className="landing-cta-text">
          <h2 id="landing-titulo-cta" className="landing-cta-title">
            Comece pelo que já está na sua despensa.
          </h2>
          <p className="landing-cta-lead">
            Cadastre a empresa e os primeiros produtos, monte uma ficha técnica
            e veja quantas porções ela rende.
          </p>
          <div className="landing-cta-actions">
            <a href="#cadastro" className="landing-button landing-button-cta">
              Criar conta da empresa
            </a>
          </div>
        </div>
        <StackedBoxes
          width="150"
          height="258"
          className="landing-jump landing-cta-mascot"
        />
      </div>
    </section>
  );
}
