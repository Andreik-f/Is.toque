import React, { useRef } from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { MOBILE_NAV, NAV_ITEMS, isNavActive } from "@/config/paths.js";

const mobileItems = MOBILE_NAV.map((id) => NAV_ITEMS.find((n) => n[0] === id));

// Menu inferior do celular. A bolha do item ativo é um elemento só, que desliza
// entre os ícones: --idx é a posição e --n o total, e o CSS divide a largura da
// barra por --n (sem medir nada em JS, e o resize se resolve sozinho).
export function MobileNav({ route }) {
  const index = mobileItems.findIndex(([id]) => isNavActive(id, route));
  // numa tela fora da barra (ex.: Reposição) a bolha some no lugar em que
  // estava, em vez de deslizar para o primeiro item
  const shown = useRef(0);
  if (index >= 0) shown.current = index;
  return (
    <nav
      className="mobile-nav"
      style={{ "--idx": shown.current, "--n": mobileItems.length }}
    >
      <span
        className="bubble-track"
        data-hidden={index < 0 || undefined}
        aria-hidden="true"
      >
        <i className="bubble" />
      </span>
      {mobileItems.map(([id, icon, label]) => (
        <a
          key={id}
          href={"#" + id}
          className={isNavActive(id, route) ? "active" : ""}
          aria-current={isNavActive(id, route) ? "page" : undefined}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}
