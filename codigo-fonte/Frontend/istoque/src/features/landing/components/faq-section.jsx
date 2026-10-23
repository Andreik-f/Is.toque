import React, { useState } from "react";

const QUESTIONS = [
  [
    "Para quem é o Is.toque?",
    "Para restaurantes, lanchonetes, bares e pequenos negócios que usam insumos em preparações e precisam saber o que está disponível, o que dá para produzir e o que precisa ser reposto.",
  ],
  [
    "O que acontece quando falta um ingrediente?",
    "A ficha técnica mostra qual ingrediente limita a receita, e a produção não pode ser confirmada acima da capacidade. Quando o saldo chega ao mínimo, o produto entra na lista de reposição.",
  ],
  [
    "Preciso instalar alguma coisa?",
    "Não. O Is.toque funciona no navegador, no computador ou no celular.",
  ],
  [
    "Quem da equipe pode usar?",
    "O administrador cadastra a empresa e convida as pessoas com um perfil: administrador, gerente ou funcionário. Cada perfil registra só o que faz parte da sua função.",
  ],
  ["Quanto custa?", "[Definir as condições de uso durante a fase de testes.]"],
  [
    "Como os dados da minha empresa são tratados?",
    "[Resumir o tratamento dos dados e linkar a política de privacidade, conforme a LGPD.]",
  ],
];

// Acordeão com uma resposta aberta por vez (a primeira começa aberta);
// clicar na aberta fecha.
export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section
      id="perguntas"
      aria-labelledby="landing-titulo-perguntas"
      className="landing-faq"
    >
      <div className="landing-faq-intro">
        <h2 id="landing-titulo-perguntas" className="landing-title-md">
          Perguntas frequentes
        </h2>
        <p className="landing-faq-lead">
          Não achou sua dúvida? Escreva para a equipe em [e-mail de contato].
        </p>
      </div>
      <div className="landing-faq-list">
        {QUESTIONS.map(([question, answer], i) => {
          const expanded = open === i;
          return (
            <div className="landing-faq-item" key={question}>
              <h3>
                <button
                  type="button"
                  className="landing-faq-button"
                  aria-expanded={expanded}
                  aria-controls={`landing-resposta-${i}`}
                  onClick={() => setOpen(expanded ? -1 : i)}
                >
                  {question}
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#164D4E"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" style={{ opacity: expanded ? 0 : 1 }} />
                  </svg>
                </button>
              </h3>
              <p
                id={`landing-resposta-${i}`}
                className="landing-faq-answer landing-enter"
                hidden={!expanded}
              >
                {answer}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
