import React, { useImperativeHandle, useRef } from "react";
import { playAnimation } from "@/lib/motion.js";

// Mascote do Is.toque em duas versões: "duas" (duas caixas empilhadas, na tela
// de acesso) e "uma" (uma caixa, no resto do sistema). O SVG é inline porque o
// olho, a fita e cada caixa se mexem separados, e uma <img> não deixa animar as
// partes. Ele é decorativo (aria-hidden): quem informa algo ao leitor de tela é
// o texto ao lado. As classes levam o prefixo "mascot-" para não colidir com o
// CSS global; os movimentos estão em styles/components/mascot.css.
//
// Props: mode escolhe a animação de CSS que roda sozinha ("entrada", "espera"
// ou "vazio"); face ({ x, y, olho }, de mascotFace) posiciona e abre o olho; e
// o ref expõe erro() e sucesso(), que tocam a reação e devolvem uma promessa.
const FACE_PADRAO = { x: 0, y: 0, olho: "aberto" };

// Caixa de baixo, com a fita, o olho e a piscadela, e a de cima por último
// (fica por cima). Cada caixa é um grupo para girar e pular sozinha. Formas do
// mascote vetorizado, sem <metadata>, <title> nem comentários.
function PecasDuas() {
  return (
    <>
      <g className="mascot-bottom">
        <g
          stroke="#22180F"
          strokeWidth="16"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <polygon
            points="105,1230 600,1330 905,1105 410,1005"
            fill="#47555A"
          />
          <polygon
            points="105,1230 600,1330 610,1845 110,1735"
            fill="#E3AC5C"
          />
          <polygon
            points="600,1330 905,1105 915,1620 610,1845"
            fill="#E8B468"
          />
          <path
            className="mascot-tape"
            d="M290,1267 L298,1418 L330,1432 L345,1398 L366,1440 L382,1408 L410,1418 L415,1293 Z"
            fill="#F2D6B3"
            strokeWidth="10"
          />
        </g>
        <ellipse
          className="mascot-eye"
          cx="243"
          cy="1530"
          rx="28"
          ry="48"
          fill="#22180F"
        />
        <polyline
          points="455,1525 397,1562 460,1608"
          fill="none"
          stroke="#22180F"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <polygon
          points="700,1440 760,1395 772,1660 712,1705"
          fill="#EEC285"
          opacity="0.4"
        />
        <polygon
          points="600,1330 905,1105 915,1620 610,1845"
          fill="none"
          stroke="#22180F"
          strokeWidth="16"
          strokeLinejoin="round"
        />
      </g>
      <g className="mascot-top">
        <g stroke="#22180F" strokeWidth="16" strokeLinejoin="round">
          <polygon points="395,400 880,490 580,725 85,635" fill="#E2AE66" />
          <polygon points="85,635 580,725 595,1225 95,1135" fill="#E3AC5C" />
          <polygon points="580,725 880,490 895,1005 595,1225" fill="#E6B264" />
        </g>
        <polygon
          points="317,459 805,549 745,596 256,506"
          fill="#EEC285"
          opacity="0.7"
        />
        <polygon
          points="685,643 745,596 760,1104 700,1148"
          fill="#EEC285"
          opacity="0.6"
        />
        <g fill="none" stroke="#22180F" strokeWidth="16" strokeLinejoin="round">
          <polygon points="395,400 880,490 580,725 85,635" />
          <polygon points="580,725 880,490 895,1005 595,1225" />
        </g>
      </g>
    </>
  );
}

// Vem de public/favicon.svg (a mesma caixa), com as classes para animar.
function PecasUma() {
  return (
    <g className="mascot-bottom">
      <g
        stroke="#22180F"
        strokeWidth="40"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points="105,1230 600,1330 905,1105 410,1005" fill="#47555A" />
        <polygon points="105,1230 600,1330 610,1845 110,1735" fill="#E3AC5C" />
        <polygon points="600,1330 905,1105 915,1620 610,1845" fill="#EBB86E" />
        <path
          className="mascot-tape"
          d="M272,1263 L280,1425 L318,1445 L338,1405 L362,1450 L382,1412 L424,1428 L430,1296 Z"
          fill="#F2D6B3"
          strokeWidth="26"
        />
      </g>
      <ellipse
        className="mascot-eye"
        cx="250"
        cy="1530"
        rx="42"
        ry="68"
        fill="#22180F"
      />
      <polyline
        points="470,1500 385,1555 475,1615"
        fill="none"
        stroke="#22180F"
        strokeWidth="44"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

// O viewBox da "duas" reproduz o enquadramento do mascote.png antigo (541×462,
// com o mascote à esquerda), e o tamanho 541×462 mantém a proporção que a tela
// de acesso já usa: assim o CSS de posição continua o mesmo.
const DESENHOS = {
  duas: { viewBox: "-950 -225 3307 2824", width: 541, height: 462 },
  uma: { viewBox: "60 975 900 900" },
};

// Os deslocamentos vêm das variáveis --mascot-d* do CSS (mudam por variante),
// por isso os keyframes usam var() e não repetem números aqui. As curvas são
// as mesmas dos tokens --ease-out e --ease-in-out.
function inclinar(svg, variant) {
  // na de duas caixas só a de cima balança; na de uma, a única peça
  const peca = svg?.querySelector(
    variant === "duas" ? ".mascot-top" : ".mascot-bottom",
  );
  return playAnimation(
    peca,
    [
      { rotate: "0deg" },
      { rotate: "-5deg", offset: 0.22 },
      { rotate: "5deg", offset: 0.48 },
      { rotate: "-3deg", offset: 0.72 },
      { rotate: "0deg" },
    ],
    { duration: 380, easing: "ease-in-out" },
  );
}

function celebrar(svg, variant) {
  const peca = (nome) => svg?.querySelector(`.mascot-${nome}`);
  const animacoes = [
    // a fita sai e fica fora (forwards): logo depois a tela segue para o sistema
    playAnimation(
      peca("tape"),
      [
        { translate: "0 0", rotate: "0deg", opacity: 1 },
        {
          translate:
            "calc(0.15 * var(--mascot-d3)) calc(-1 * var(--mascot-d3))",
          rotate: "16deg",
          opacity: 0,
        },
      ],
      { duration: 450, easing: "ease-out", fill: "forwards" },
    ),
    playAnimation(
      peca("bottom"),
      [
        { translate: "0 0", scale: "1 1" },
        {
          translate: "0 calc(-1 * var(--mascot-d1))",
          scale: "1 1.03",
          offset: 0.3,
        },
        { translate: "0 0", scale: "1 0.95", offset: 0.62 },
        { translate: "0 0", scale: "1 1" },
      ],
      { duration: 480, easing: "ease-out" },
    ),
  ];
  if (variant === "duas")
    animacoes.push(
      // a caixa de cima sobe mais e um pouco depois, como quem foi levada junto
      playAnimation(
        peca("top"),
        [
          { translate: "0 0" },
          { translate: "0 calc(-1.5 * var(--mascot-d1))", offset: 0.34 },
          { translate: "0 0", offset: 0.68 },
          { translate: "0 0" },
        ],
        { duration: 520, delay: 50, easing: "ease-out", fill: "backwards" },
      ),
    );
  return Promise.all(animacoes).then(() => undefined);
}

export function Mascot({
  variant = "duas",
  mode,
  face = FACE_PADRAO,
  ref,
  className = "",
}) {
  const svg = useRef(null);
  useImperativeHandle(
    ref,
    () => ({
      erro: () => inclinar(svg.current, variant),
      sucesso: () => celebrar(svg.current, variant),
    }),
    [variant],
  );
  const Pecas = variant === "duas" ? PecasDuas : PecasUma;
  return (
    <svg
      ref={svg}
      className={className ? `mascot ${className}` : "mascot"}
      data-variant={variant}
      data-mode={mode}
      data-eye={face.olho}
      style={{ "--mascot-x": `${face.x}px`, "--mascot-y": `${face.y}px` }}
      xmlns="http://www.w3.org/2000/svg"
      {...DESENHOS[variant]}
      aria-hidden="true"
      focusable="false"
    >
      <Pecas />
    </svg>
  );
}
