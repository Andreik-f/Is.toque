import React, { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion.js";
import { FRAME_INTERVAL, frameState } from "../utils/simulation.js";
import { StackedBoxes } from "./landing-mascot.jsx";

// Painel que simula um dia de cozinha sozinho, um quadro a cada 2,8 s. Fica
// parado fora da tela e, com reduzir movimento, nem começa.
export function LivePanel() {
  const [step, setStep] = useState(0);
  const panelRef = useRef(null);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let visible = true;
    const timer = setInterval(() => {
      if (visible) setStep((s) => s + 1);
    }, FRAME_INTERVAL);
    let observer;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });
      observer.observe(panelRef.current);
    }
    return () => {
      clearInterval(timer);
      observer?.disconnect();
    };
  }, []);

  const state = frameState(step);
  const { current } = state;
  return (
    <div className="landing-panel-wrap">
      <div className="landing-tilt">
        <StackedBoxes
          width="96"
          height="165"
          className="landing-panel-mascot"
        />
        <div className="landing-panel" data-painel-ao-vivo="sim" ref={panelRef}>
          <div className="landing-panel-bar">
            <div className="landing-panel-bar-title">
              <svg
                width="52"
                height="12"
                viewBox="0 0 52 12"
                aria-hidden="true"
              >
                <circle cx="6" cy="6" r="5" fill="#EF735F" />
                <circle cx="26" cy="6" r="5" fill="#F5B84F" />
                <circle cx="46" cy="6" r="5" fill="#72CAA9" />
              </svg>
              <span>Cozinha da Casa / Hambúrguer da casa</span>
            </div>
          </div>

          <div className="landing-panel-columns">
            <div className="landing-panel-moves">
              <h2 className="landing-panel-heading">Movimentações</h2>
              {/* a key troca a cada quadro e refaz a entrada do cartão */}
              <div className="landing-move-card landing-enter" key={step}>
                <div className="landing-move-card-top">
                  <span
                    className="landing-move-badge"
                    style={{
                      background: current.background,
                      color: current.color,
                    }}
                  >
                    {current.type}
                  </span>
                  <span className="landing-move-now">agora</span>
                </div>
                <p className="landing-move-title">{current.title}</p>
                <p className="landing-move-amount">{current.amount}</p>
              </div>
              <div className="landing-history">
                {state.history.map((move, k) => (
                  <div className="landing-history-row" key={k}>
                    <span
                      className="landing-history-dot"
                      style={{ background: move.color }}
                    />
                    <span className="landing-history-text">{`${move.type}: ${move.title}`}</span>
                    <span className="landing-history-amount">
                      {move.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-panel-ingredients">
              <div className="landing-panel-ingredients-head">
                <h2 className="landing-panel-heading">
                  Ingredientes por porção
                </h2>
                <span>saldo em estoque</span>
              </div>
              {/* as linhas não remontam: a barra e as cores mudam com transição */}
              {state.ingredients.map((item) => (
                <div
                  key={item.key}
                  className={
                    "landing-ingredient" + (item.limiting ? " is-limiting" : "")
                  }
                >
                  <div className="landing-ingredient-info">
                    <span className="landing-ingredient-name">
                      {item.name}
                      <span className="landing-ingredient-portion">
                        {item.portionText}
                      </span>
                    </span>
                    <span className="landing-ingredient-stock">
                      {item.stockText}
                      <span className="landing-ingredient-yields">
                        {item.yieldsText}
                      </span>
                    </span>
                  </div>
                  <div className="landing-ingredient-track">
                    <div
                      className="landing-ingredient-fill"
                      style={{ transform: `scaleX(${item.fill.toFixed(3)})` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="landing-panel-capacity">
              <span className="landing-capacity-caption">Capacidade atual</span>
              <span className="landing-capacity-number" key={step}>
                {state.capacity}
              </span>
              <span className="landing-capacity-label">
                {state.capacityLabel}
              </span>
              <div className="landing-limiting">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F5B84F"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                  <path d="M12 9v4" />
                  <path d="M12 17h.01" />
                </svg>
                <div className="landing-limiting-text">
                  <span className="landing-limiting-caption">Limitante</span>
                  <span className="landing-limiting-name">
                    {state.limiting}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
