import React from "react";

export function MobileSection() {
  return (
    <section
      id="celular"
      aria-labelledby="landing-titulo-celular"
      className="landing-mobile"
    >
      <div className="landing-mobile-card">
        <div className="landing-mobile-text">
          <h2 id="landing-titulo-celular" className="landing-title-md">
            Do escritório à cozinha.
          </h2>
          <p className="landing-mobile-lead">
            O Is.toque funciona no navegador. No celular, o menu desce para
            perto do polegar e as telas se ajustam para registrar uma saída sem
            largar a panela.
          </p>
        </div>
        <div className="landing-mobile-stage">
          <figure className="landing-mobile-desktop landing-parallax-slow">
            <img
              src="/landing/relatorios.webp"
              alt="Relatórios do Is.toque com movimentações por tipo e perdas por ingrediente"
              width="2880"
              height="1800"
              loading="lazy"
              decoding="async"
            />
          </figure>
          <figure className="landing-mobile-phone landing-parallax">
            <img
              src="/landing/dashboard-mobile.webp"
              alt="Visão geral do Is.toque no celular com o menu na parte de baixo"
              width="780"
              height="1688"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
