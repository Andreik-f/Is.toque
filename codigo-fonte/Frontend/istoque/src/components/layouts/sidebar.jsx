import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { Mascot } from "@/components/ui/mascot.jsx";
import { NAV_ITEMS, isNavActive } from "@/config/paths.js";
import { useChangeCount } from "@/hooks/use-change-count.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { initials } from "@/utils/format.js";
import { temPermissao } from "@/utils/permissions.js";

// Menu lateral. profile: { company, userName, role } mostrados no menu; open:
// menu aberto no celular; onNavigate fecha o menu; lowCount: produtos no
// mínimo, mostrado ao lado de "Estoque".
export function Sidebar({ route, profile, open, onNavigate, lowCount }) {
  const { resetData } = useDemoStore();
  const { session, signOut } = useSession();
  const { closeModal, notify } = useUiStore();
  const { company, userName, role } = profile;
  const nav = useRef(null);
  const indicator = useRef(null);
  const [ready, setReady] = useState(false);
  const activeIndex = NAV_ITEMS.findIndex(([id]) => isNavActive(id, route));
  // A aba ativa é um único elemento que desliza até o item ativo. Aqui se mede
  // onde o item está e grava em --y; o layout effect roda antes da pintura, e
  // por isso a primeira posição não passa por transição (só liga em "ready").
  useLayoutEffect(() => {
    const place = () => {
      const link = nav.current.querySelectorAll("a")[activeIndex];
      indicator.current.style.setProperty("--y", `${link?.offsetTop ?? 0}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [activeIndex]);
  useEffect(() => setReady(true), []);
  // o círculo âmbar faz um pop a cada troca de item, mas não ao abrir
  const moves = useChangeCount(activeIndex);
  // o contador de estoque baixo troca com fade, mas só quando o número muda
  const lowChanges = useChangeCount(lowCount);
  const reset = () => {
    resetData();
    closeModal();
    navigate("dashboard");
    notify("Demonstração reiniciada.");
  };
  const logout = () => {
    closeModal();
    signOut();
    navigate("login");
  };
  return (
    // no celular, qualquer link ou botão do menu fecha o menu, mesmo quando
    // leva à tela que já está aberta (aí a rota não muda)
    <aside
      className={"sidebar " + (open ? "open" : "")}
      onClick={(e) => e.target.closest("a, button") && onNavigate()}
    >
      {/* o mascote é decorativo: o nome do link vem do aria-label */}
      <a className="logo" href="#dashboard" aria-label="Is.toque">
        <span className="logo-mark">
          <Mascot variant="uma" />
        </span>
        <span>
          Is<span className="logo-dot">.</span>toque
        </span>
      </a>
      <div className="workspace">
        <span className="workspace-icon">{initials(company)[0]}</span>
        <div>
          <strong>{company}</strong>
          <small>
            {session ? "Sua empresa" : "Restaurante • Demonstração"}
          </small>
        </div>
      </div>
      <div className="nav-label">PRINCIPAL</div>
      <nav ref={nav}>
        {/* fora do menu (ex.: #fluxos) não há item ativo: a aba some */}
        <span
          ref={indicator}
          className={"nav-indicator" + (ready ? " ready" : "")}
          data-hidden={activeIndex < 0 || undefined}
          aria-hidden="true"
        >
          <i key={moves} className={"nav-dot" + (moves ? " pop" : "")} />
        </span>
        {NAV_ITEMS.map(([id, icon, label], position) => (
          <a
            href={"#" + id}
            key={id}
            style={{ "--i": position }}
            className={isNavActive(id, route) ? "active" : ""}
            aria-current={isNavActive(id, route) ? "page" : undefined}
          >
            <Icon name={icon} />
            <span>{label}</span>
            {id === "estoque" && lowCount > 0 && (
              <b key={lowChanges} className={lowChanges ? "bump" : undefined}>
                {lowCount}
              </b>
            )}
          </a>
        ))}
      </nav>
      <div className="sidebar-bottom">
        {/* o mapa de fluxos documenta o protótipo: só na demonstração */}
        {!session && (
          <a href="#fluxos">
            <Icon name="chart" />
            Mapa de fluxos
          </a>
        )}
        {temPermissao(session, "empresa.configurar") && (
          <a href="#empresa">
            <Icon name="shield" />
            Configurações
          </a>
        )}
        {session ? (
          <button onClick={logout}>
            <Icon name="logout" />
            Sair
          </button>
        ) : (
          <>
            <button onClick={reset}>
              <Icon name="arrows" />
              Reiniciar demonstração
            </button>
            <a href="#login">
              <Icon name="logout" />
              Tela de acesso
            </a>
          </>
        )}
        <div className="user">
          <div className="avatar">{initials(userName)}</div>
          <div>
            <strong>{userName}</strong>
            <small>{role}</small>
          </div>
          <Icon name="down" size={16} />
        </div>
      </div>
    </aside>
  );
}
