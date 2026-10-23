import React from "react";
import { scrollToSection, scrollToTop } from "../utils/scroll.js";
import { SingleBox } from "./landing-mascot.jsx";

export function LandingHeader() {
  return (
    <header className="landing-header">
      <div className="landing-header-inner">
        <a
          href="#inicio"
          className="landing-brand"
          aria-label="Is.toque, página inicial"
          onClick={(event) => {
            event.preventDefault();
            scrollToTop();
          }}
        >
          <span className="landing-brand-icon">
            <SingleBox size="30" />
          </span>
          <span className="landing-brand-name">
            Is<span className="landing-brand-dot">.</span>toque
          </span>
        </a>
        <nav aria-label="Principal" className="landing-nav">
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("como-funciona")}
          >
            Como funciona
          </button>
          <button
            type="button"
            className="landing-nav-link"
            onClick={() => scrollToSection("perguntas")}
          >
            Perguntas
          </button>
        </nav>
        <a href="#login" className="landing-signin">
          Entrar
        </a>
      </div>
    </header>
  );
}
