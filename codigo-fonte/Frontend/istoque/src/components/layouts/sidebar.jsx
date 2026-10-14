import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { NAV_ITEMS, isNavActive } from "@/config/paths.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { initials } from "@/utils/format.js";

// Menu lateral. profile: { company, userName, role } mostrados no menu; open:
// menu aberto no celular; onNavigate fecha o menu; lowCount: produtos no
// mínimo, mostrado ao lado de "Estoque".
export function Sidebar({ route, profile, open, onNavigate, lowCount }) {
  const { resetData } = useDemoStore();
  const { session, signOut } = useSession();
  const { closeModal, notify } = useUiStore();
  const { company, userName, role } = profile;
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
            {id === "estoque" && lowCount > 0 && <b>{lowCount}</b>}
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
  );
}
