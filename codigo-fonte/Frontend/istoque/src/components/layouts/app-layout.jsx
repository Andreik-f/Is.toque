import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { DEMO_PROFILE } from "@/config/demo.js";
import {
  LOCAL_ONLY_ROUTES,
  MOBILE_NAV,
  NAV_ITEMS,
  isNavActive,
  routeTitle,
} from "@/config/paths.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { isExpiringSoon, isLow } from "@/utils/inventory.js";

const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const mobileItems = MOBILE_NAV.map((id) => NAV_ITEMS.find((n) => n[0] === id));

// Estrutura comum das telas internas: menu lateral, barra do topo, rodapé e
// menu inferior do celular. O conteúdo da rota entra em `children`; avisos e
// modais entram em `overlays`. Com login, mostra a empresa e o usuário da
// sessão; sem login, os da demonstração.
export function AppLayout({ route, children, overlays }) {
  const { products, today, resetData } = useDemoStore();
  const { session, signOut } = useSession();
  const { openModal, closeModal, notify } = useUiStore();
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => setMobileMenu(false), [route]);
  const low = products.filter(isLow);
  const hasAlerts =
    low.length > 0 || products.some((p) => isExpiringSoon(p, today));
  const company = session?.nomeEmpresa ?? DEMO_PROFILE.company;
  const userName = session?.nome ?? DEMO_PROFILE.userName;
  const role = session?.perfil ?? DEMO_PROFILE.role;
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
    <div className="app">
      {/* no celular, qualquer link ou botão do menu fecha o menu, mesmo quando
          leva à tela que já está aberta (aí a rota não muda) */}
      <aside
        className={"sidebar " + (mobileMenu ? "open" : "")}
        onClick={(e) => e.target.closest("a, button") && setMobileMenu(false)}
      >
        <a className="logo" href="#dashboard">
          <span className="logo-mark">
            <Icon name="box" size={29} />
          </span>
          ISTOQUE<span className="logo-dot">.</span>
        </a>
        <div className="workspace">
          <span className="workspace-icon">{initials(company)[0]}</span>
          <div>
            <strong>{company}</strong>
            <small>{session ? "Sua empresa" : "Restaurante • Demonstração"}</small>
          </div>
        </div>
        <div className="nav-label">PRINCIPAL</div>
        <nav>
          {NAV_ITEMS.map(([id, icon, label]) => (
            <a
              href={"#" + id}
              key={id}
              className={isNavActive(id, route) ? "active" : ""}
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
          {/* o mapa de fluxos documenta o protótipo: só na demonstração */}
          {!session && (
            <a href="#fluxos">
              <Icon name="chart" />
              Mapa de fluxos
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
              {session ? "Conectado ao servidor" : "Protótipo interativo"}
            </span>
            <button
              className="icon-button notification"
              aria-label="Ver alertas"
              onClick={() => openModal({ type: "alerts" })}
            >
              <Icon name="bell" />
              {hasAlerts && <i />}
            </button>
            <div className="avatar light">{initials(userName)}</div>
          </div>
        </header>
        <main>
          {session && LOCAL_ONLY_ROUTES.includes(route) && (
            <div className="notice">
              <Icon name="alert" />
              <span>
                Esta tela ainda não grava no servidor: o que você registrar
                aqui vale até recarregar a página.
              </span>
            </div>
          )}
          {children}
          <footer className="page-footer">
            <span>ISTOQUE • Feito para a rotina da sua cozinha.</span>
            <span>
              {session
                ? "Produtos e categorias salvos no servidor"
                : "Dados fictícios • alterações duram até recarregar"}
            </span>
          </footer>
        </main>
        <nav className="mobile-nav">
          {mobileItems.map(([id, icon, label]) => (
            <a
              key={id}
              href={"#" + id}
              className={isNavActive(id, route) ? "active" : ""}
            >
              <Icon name={icon} />
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </div>
      {overlays}
    </div>
  );
}
