import React from "react";

const BURGERS = 20;
const ALWAYS_LIT = 8;

function Burger({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="30 20 140 110"
      aria-hidden="true"
    >
      <path d="M44 67c0-54 112-54 112 0Z" fill="#F5B84F" />
      <path
        d="M44 73h112"
        stroke="#72CAA9"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M44 84h112"
        stroke="#714331"
        strokeWidth="14"
        strokeLinecap="round"
      />
      <path d="M44 100h112q0 18-20 18H64q-20 0-20-18" fill="#E8A243" />
    </svg>
  );
}

// Os 8 primeiros ficam acesos; os outros apagam um a um conforme a rolagem,
// cada um numa faixa de 4% logo depois do anterior.
function fadeRange(i) {
  return { animationRange: `cover ${22 + 3 * i}% cover ${26 + 3 * i}%` };
}

function Bar({ label, value, fill }) {
  return (
    <div className="landing-bar">
      <div className="landing-bar-head">
        <span className="landing-bar-label">{label}</span>
        {value}
      </div>
      <div className="landing-bar-track">{fill}</div>
    </div>
  );
}

export function ProblemSection() {
  return (
    <section
      aria-labelledby="landing-titulo-problema"
      className="landing-problem"
    >
      <div className="landing-problem-inner">
        <div className="landing-problem-text">
          <h2
            id="landing-titulo-problema"
            className="landing-section-title landing-problem-title"
          >
            Ter pão e carne não garante o hambúrguer.
          </h2>
          <p className="landing-problem-lead">
            Pães e hambúrgueres para vinte sanduíches não adiantam se o queijo
            só dá para oito. Conferir isso de cabeça, ingrediente por
            ingrediente, leva a compras desnecessárias, falta no meio do preparo
            e produto vencendo no fundo da câmara fria.
          </p>
          <div className="landing-proofs">
            <div className="landing-proof">
              <p className="landing-proof-number">28%</p>
              <p className="landing-proof-text">
                dos resíduos alimentares gerados no mundo em 2022 vieram dos
                serviços de alimentação.
              </p>
              <a
                className="landing-proof-source"
                href="https://brasil.un.org/pt-br/264460-%C3%ADndice-de-desperd%C3%ADcio-de-alimentos-2024"
              >
                Fonte: PNUMA, Índice de Desperdício de Alimentos 2024
              </a>
            </div>
            <div className="landing-proof">
              <p className="landing-proof-name">Ficha técnica</p>
              <p className="landing-proof-text">
                O Sebrae aponta a ficha técnica como forma de estimar o uso dos
                ingredientes e prevenir o desperdício.
              </p>
              <a
                className="landing-proof-source"
                href="https://portfolio-sebraetec.sebrae.com.br/fichas/14062-9--elaboracao-de-cardapio-e-ou-fichas-tecnicas-para-segmentos-de-alimentacao"
              >
                Fonte: Sebrae, Elaboração de cardápio e fichas técnicas
              </a>
            </div>
          </div>
        </div>

        <div className="landing-problem-card">
          <div className="landing-bars">
            <Bar
              label="Pão de hambúrguer"
              value={<span>dá para 20</span>}
              fill={<div className="landing-bar-fill" />}
            />
            <Bar
              label="Hambúrguer"
              value={<span>dá para 20</span>}
              fill={<div className="landing-bar-fill" />}
            />
            <Bar
              label="Queijo"
              value={<span className="landing-bar-limit">dá para 8</span>}
              fill={<div className="landing-bar-fill landing-bar-cheese" />}
            />
          </div>
          <div className="landing-burgers" aria-hidden="true">
            {Array.from({ length: BURGERS }, (_, i) =>
              i < ALWAYS_LIT ? (
                <Burger key={i} />
              ) : (
                <Burger
                  key={i}
                  className="landing-burger-fade"
                  style={fadeRange(i - ALWAYS_LIT)}
                />
              ),
            )}
          </div>
          <p className="landing-problem-note">
            O queijo define o limite: <strong>8 sanduíches</strong>. O Is.toque
            faz essa conta para cada receita, a cada movimentação.
          </p>
        </div>
      </div>
    </section>
  );
}
