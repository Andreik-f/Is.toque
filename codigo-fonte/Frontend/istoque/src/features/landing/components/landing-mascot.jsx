import React from "react";

// Mascote das duas caixas. A caixa de cima é desenhada por último para ficar
// na frente da de baixo enquanto balança.
export function StackedBoxes({ width, height, className }) {
  return (
    <svg
      className={className}
      viewBox="70 385 860 1475"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <g
        stroke="#22180F"
        strokeWidth="16"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points="105,1230 600,1330 905,1105 410,1005" fill="#47555A" />
        <polygon points="105,1230 600,1330 610,1845 110,1735" fill="#E3AC5C" />
        <polygon points="600,1330 905,1105 915,1620 610,1845" fill="#E8B468" />
        <path
          d="M290,1267 L298,1418 L330,1432 L345,1398 L366,1440 L382,1408 L410,1418 L415,1293 Z"
          fill="#F2D6B3"
          strokeWidth="10"
        />
      </g>
      <ellipse
        className="landing-blink"
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
        points="600,1330 905,1105 915,1620 610,1845"
        fill="none"
        stroke="#22180F"
        strokeWidth="16"
        strokeLinejoin="round"
      />
      <g className="landing-sway">
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
    </svg>
  );
}

// Caixa sozinha: o ícone do logo (traço mais grosso, olho parado) e a caixinha
// que desce pelo trilho (olho piscando).
export function SingleBox({
  size,
  className,
  blink = false,
  stroke = 44,
  tapeStroke = 28,
}) {
  return (
    <svg
      className={className}
      viewBox="60 975 900 900"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <g
        stroke="#22180F"
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <polygon points="105,1230 600,1330 905,1105 410,1005" fill="#47555A" />
        <polygon points="105,1230 600,1330 610,1845 110,1735" fill="#E3AC5C" />
        <polygon points="600,1330 905,1105 915,1620 610,1845" fill="#EBB86E" />
        <path
          d="M272,1263 L280,1425 L318,1445 L338,1405 L362,1450 L382,1412 L424,1428 L430,1296 Z"
          fill="#F2D6B3"
          strokeWidth={tapeStroke}
        />
      </g>
      <ellipse
        className={blink ? "landing-blink" : undefined}
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
    </svg>
  );
}
