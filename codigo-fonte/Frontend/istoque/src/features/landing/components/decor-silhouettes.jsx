import React from "react";

// Silhuetas de alimentos ao fundo das faixas verdes, quase transparentes.
const TOMATO =
  "M103 45C75 21 41 48 47 79c5 29 32 41 56 31 27 11 54-10 54-36 0-30-30-47-54-29";

function Tomato({ className, width, height, withLeaf = true }) {
  return (
    <svg
      className={className}
      viewBox="40 15 125 100"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <path d={TOMATO} fill="#FFFDF8" opacity="0.05" />
      {withLeaf && (
        <path
          d="m102 49-29-9 19-3-4-16 17 16 17-13-5 19 18 6-28 6"
          fill="#FFFDF8"
          opacity="0.05"
        />
      )}
    </svg>
  );
}

function Cheese({ className, width, height }) {
  return (
    <svg
      className={className}
      viewBox="40 30 125 95"
      width={width}
      height={height}
      aria-hidden="true"
    >
      <path d="m48 84 81-48 28 28-109 49Z" fill="#FFFDF8" opacity="0.05" />
      <path d="m48 84 109-20v28L48 116Z" fill="#FFFDF8" opacity="0.04" />
    </svg>
  );
}

export function HeroSilhouettes() {
  return (
    <>
      <Tomato
        className="landing-float landing-decor-tomato"
        width="190"
        height="152"
      />
      <svg
        className="landing-float-slow landing-decor-leaves"
        viewBox="40 20 130 100"
        width="230"
        height="177"
        aria-hidden="true"
      >
        <g fill="#FFFDF8" opacity="0.05">
          <ellipse
            cx="74"
            cy="60"
            rx="23"
            ry="35"
            transform="rotate(-30 74 60)"
          />
          <ellipse
            cx="112"
            cy="57"
            rx="23"
            ry="36"
            transform="rotate(20 112 57)"
          />
          <ellipse
            cx="137"
            cy="76"
            rx="25"
            ry="30"
            transform="rotate(50 137 76)"
          />
        </g>
      </svg>
      <Cheese
        className="landing-float-mid landing-decor-cheese"
        width="170"
        height="129"
      />
      <svg
        className="landing-float landing-decor-burger"
        viewBox="40 20 125 105"
        width="180"
        height="151"
        aria-hidden="true"
      >
        <path d="M44 67c0-54 112-54 112 0Z" fill="#FFFDF8" opacity="0.05" />
        <path
          d="M44 100h112q0 18-20 18H64q-20 0-20-18"
          fill="#FFFDF8"
          opacity="0.05"
        />
      </svg>
      <svg
        className="landing-float-slow landing-decor-jar"
        viewBox="55 20 90 100"
        width="120"
        height="133"
        aria-hidden="true"
      >
        <rect
          x="67"
          y="27"
          width="67"
          height="18"
          rx="5"
          fill="#FFFDF8"
          opacity="0.05"
        />
        <rect
          x="63"
          y="45"
          width="75"
          height="72"
          rx="13"
          fill="#FFFDF8"
          opacity="0.05"
        />
      </svg>
    </>
  );
}

export function CtaSilhouettes() {
  return (
    <>
      <Tomato
        className="landing-float-slow landing-cta-tomato"
        width="220"
        height="176"
        withLeaf={false}
      />
      <Cheese
        className="landing-float landing-cta-cheese"
        width="180"
        height="137"
      />
    </>
  );
}
