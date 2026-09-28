import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { NAV_ITEMS, routeTitle } from "@/config/paths.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { isLow } from "@/utils/inventory.js";

// Estrutura comum das telas internas: menu lateral, barra do topo, rodapé e
// menu inferior do celular. O conteúdo da rota entra em `children`; avisos e
// modais entram em `overlays`.
export function AppLayout({ route, children, overlays }) {
  const { products, resetData } = useDemoStore();
  const { openModal, closeModal, notify } = useUiStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => setMobileMenu(false), [route]);
  const low = products.filter(isLow);
  const reset = () => {
    resetData();
    closeModal();
    navigate("dashboard");
    notify("Demonstração reiniciada.");
  };
  return (
    <div className="app">
      <aside className={"sidebar " + (mobileMenu ? "open" : "")}>
        <a className="logo" href="#dashboard">
          <span className="logo-mark">
            <Icon name="box" size={29} />
          </span>
          ISTOQUE<span className="logo-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">C</span>
          <div>
            <strong>Cozinha da Casa</strong>
            <small>Restaurante • Demonstração</small>
          </div>
        </div>
        <div className="nav-label">PRINCIPAL</div>
        <nav>
          {NAV_ITEMS.map(([id, icon, label]) => (
            <a
              href={"#" + id}
              key={id}
              className={
                route === id ||
                (id === "estoque" && route === "produto") ||
                (id === "receitas" && route === "receita")
                  ? "active"
                  : ""
              }
            >
              <Icon name={icon} />
              <span>{label}</span>
              {id === "estoque" && low.length > 0 && <b>{low.length}</b>}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span>
              Menos perdas.
              <br />
              <strong>Mais possibilidades.</strong>
            </span>
            <Icon name="recipe" size={34} />
          </div>
          <a href="#fluxos">
            <Icon name="chart" />
            Mapa de fluxos
          </a>
          <button onClick={reset}>
            <Icon name="arrows" />
            Reiniciar demonstração
          </button>
          <a href="#login">
            <Icon name="logout" />
            Tela de acesso
          </a>
          <div className="user">
            <div className="avatar">DR</div>
            <div>
              <strong>David Rocha</strong>
              <small>Administrador</small>
            </div>
            <Icon name="down" size={16} />
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="scrim"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="shell">
        <header className="topbar">
          <button
            className="icon-button mobile-only"
            aria-label="Abrir menu"
            onClick={() => setMobileMenu(true)}
          >
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">
            Workspace <Icon name="chevron" size={14} />
            <span>{routeTitle(route)}</span>
          </div>
          <div className="topbar-right">
            <span className="demo-label">
              <i />
              Protótipo interativo
            </span>
            <button
              className="icon-button notification"
              aria-label="Ver alertas"
              onClick={() => openModal({ type: "alerts" })}
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="avatar light">DR</div>
          </div>
        </header>
        <main>
          {children}
          <footer className="page-footer">
            <span>ISTOQUE • Feito para a rotina da sua cozinha.</span>
            <span>Dados fictícios • alterações duram até recarregar</span>
          </footer>
        </main>
        <nav className="mobile-nav">
          {[NAV_ITEMS[0], NAV_ITEMS[1], NAV_ITEMS[3], NAV_ITEMS[2]].map(
            ([id, icon, label]) => (
              <a
                key={id}
                href={"#" + id}
                className={route === id ? "active" : ""}
              >
                <Icon name={icon} />
                <span>{label}</span>
              </a>
            ),
          )}
        </nav>
      </div>
      {overlays}
    </div>
  );
}
