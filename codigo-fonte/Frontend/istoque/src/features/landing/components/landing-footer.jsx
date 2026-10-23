import React from "react";
import { scrollToSection } from "../utils/scroll.js";

const TEAM = [
  "Amauri Luca Martinez Azevedo",
  "Andreik Fernandes Rocha",
  "David William da Silva Rocha",
  "Eduardo Rezende Machado",
];

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-inner">
        <div className="landing-footer-columns">
          <div className="landing-footer-brand">
            <span className="landing-footer-name">
              Is<span className="landing-footer-dot">.</span>toque
            </span>
            <p>
              Controle de estoque, receitas e produção para restaurantes e
              pequenos negócios.
            </p>
          </div>
          <nav aria-label="Produto" className="landing-footer-nav">
            <h3>Produto</h3>
            <button
              type="button"
              onClick={() => scrollToSection("como-funciona")}
            >
              Como funciona
            </button>
            <button type="button" onClick={() => scrollToSection("perguntas")}>
              Perguntas frequentes
            </button>
          </nav>
          <div className="landing-footer-column">
            <h3>Projeto</h3>
            <p>
              Trabalho Interdisciplinar de ADS, PUC Minas, 2º semestre de 2026
            </p>
            <p>Orientador: Paulo Henrique Rodrigues</p>
            <a href="https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1">
              Documentação no GitHub
            </a>
          </div>
          <div className="landing-footer-column">
            <h3>Equipe</h3>
            {TEAM.map((name) => (
              <p key={name}>{name}</p>
            ))}
          </div>
        </div>
        <div className="landing-footer-bottom">
          <span>© 2026 Is.toque</span>
        </div>
      </div>
    </footer>
  );
}
