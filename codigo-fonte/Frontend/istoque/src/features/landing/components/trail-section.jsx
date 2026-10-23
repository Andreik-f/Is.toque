import React from "react";
import { SingleBox } from "./landing-mascot.jsx";

const STEPS = [
  {
    tag: "Etapa 1 de 4: Estoque",
    title: "Cada ingrediente na sua unidade.",
    text: "Cadastre os produtos com unidade, estoque mínimo e máximo, e marque os que têm validade. O saldo aparece na hora, com aviso quando chega ao mínimo.",
    items: [
      "Alerta quando o saldo chega ao mínimo",
      "Validade informada em cada entrada",
      "Busca e filtro por categoria",
    ],
    image: "/landing/estoque.webp",
    alt: "Tela de estoque do Is.toque com cartões de ingredientes, saldo, mínimo e validade",
  },
  {
    tag: "Etapa 2 de 4: Ficha técnica",
    title: "A receita diz quanto dá para fazer.",
    text: "Informe quanto de cada ingrediente vai em uma porção. O Is.toque calcula quantas porções o estoque atual permite e destaca o ingrediente que limita.",
    items: [
      "Capacidade recalculada a cada movimentação",
      "Ingrediente limitante em destaque",
      "Salvar a ficha não mexe no estoque",
    ],
    image: "/landing/receita-burger.webp",
    alt: "Ficha técnica do Hambúrguer da casa: 12 porções disponíveis e o tomate italiano como ingrediente limitante",
  },
  {
    tag: "Etapa 3 de 4: Produção",
    title: "Registrou a produção, baixou tudo.",
    text: "Antes de confirmar, você vê o consumo de cada ingrediente e o saldo que vai sobrar. Na confirmação, todos saem do estoque juntos, com o responsável registrado.",
    items: [
      "Bloqueio quando a quantidade passa da capacidade",
      "Consumo e saldo final de cada ingrediente",
      "Histórico com data, quantidade e responsável",
    ],
    image: "/landing/producao-revisao.webp",
    alt: "Janela de registrar produção com 5 hambúrgueres e o consumo previsto de cada ingrediente",
  },
  {
    tag: "Etapa 4 de 4: Reposição",
    title: "Compre o que vai faltar, não o que sobra.",
    text: "A lista de reposição reúne os produtos no mínimo ou abaixo dele e sugere quanto comprar para voltar ao máximo cadastrado.",
    items: [
      "Entrada registrada direto da lista",
      "Lista exportável em CSV",
      "Relatórios de entradas, saídas e perdas por período",
    ],
    image: "/landing/reposicao.webp",
    alt: "Lista de compras sugerida com os produtos abaixo do mínimo e a quantidade para repor",
  },
];

function Check() {
  return (
    <svg
      className="landing-check"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#277957"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  );
}

// Etapas pares mostram a imagem primeiro; o wrap-reverse põe o texto em cima
// quando as colunas quebram no celular.
function Step({ step, index }) {
  const imageFirst = index % 2 === 1;
  const text = (
    <div className="landing-step-text">
      <span className="landing-step-tag">{step.tag}</span>
      <h3 className="landing-step-title">{step.title}</h3>
      <p className="landing-step-description">{step.text}</p>
      <ul className="landing-step-list">
        {step.items.map((item) => (
          <li key={item}>
            <Check />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
  const figure = (
    <figure className="landing-shot landing-rise">
      <img
        src={step.image}
        alt={step.alt}
        width="2880"
        height="1800"
        loading="lazy"
        decoding="async"
      />
    </figure>
  );
  return (
    <li className={"landing-step" + (imageFirst ? " is-reversed" : "")}>
      <span className="landing-station" aria-hidden="true" />
      {imageFirst ? figure : text}
      {imageFirst ? text : figure}
    </li>
  );
}

export function TrailSection() {
  return (
    <section
      id="como-funciona"
      aria-labelledby="landing-titulo-trilho"
      className="landing-trail"
    >
      <div className="landing-trail-head">
        <h2 id="landing-titulo-trilho" className="landing-section-title">
          Do recebimento ao prato, um caminho só.
        </h2>
        <p className="landing-trail-lead">
          Quatro etapas que se alimentam: o que entra no estoque muda a
          capacidade das receitas, e o que sai na produção aparece na reposição.
        </p>
      </div>

      <div className="landing-trail-body">
        <div className="landing-rail" aria-hidden="true">
          <div className="landing-rail-dashes" />
          <div className="landing-rail-progress" />
          {/* sticky + scaleY na linha: animar top deixava a caixinha travando */}
          <SingleBox
            size="44"
            className="landing-rail-box"
            blink
            stroke={40}
            tapeStroke={26}
          />
        </div>
        <ol className="landing-steps">
          {STEPS.map((step, i) => (
            <Step key={step.tag} step={step} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
