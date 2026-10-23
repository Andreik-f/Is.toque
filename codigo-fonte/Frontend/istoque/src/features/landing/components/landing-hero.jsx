import React from "react";
import { scrollToSection } from "../utils/scroll.js";
import { HeroSilhouettes } from "./decor-silhouettes.jsx";
import { LivePanel } from "./live-panel.jsx";

export function LandingHero() {
  return (
    <div className="landing-hero">
      <HeroSilhouettes />
      <section
        aria-labelledby="landing-titulo-hero"
        className="landing-hero-intro"
      >
        <span className="landing-hero-tag">
          Para restaurantes, lanchonetes e pequenos negócios
        </span>
        <h1 id="landing-titulo-hero" className="landing-hero-title">
          Saiba quantas porções a sua cozinha consegue fazer hoje.
        </h1>
        <p className="landing-hero-text">
          O Is.toque cruza o estoque com as fichas técnicas, mostra qual
          ingrediente vai faltar primeiro e dá baixa em tudo quando você
          registra a produção.
        </p>
        <div className="landing-hero-actions">
          <a href="#cadastro" className="landing-button landing-button-hero">
            Criar conta da empresa
          </a>
          <button
            type="button"
            className="landing-button-outline"
            onClick={() => scrollToSection("como-funciona")}
          >
            Ver como funciona
          </button>
        </div>
      </section>
      <LivePanel />
    </div>
  );
}
