import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { routeTitle } from "@/config/paths.js";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { initials } from "@/utils/format.js";

// Barra do topo: menu do celular, caminho da tela, estado da conexão e sino
// de alertas. hasAlerts acende o ponto do sino.
export function Topbar({ route, userName, hasAlerts, onOpenMenu }) {
  const { session } = useSession();
  const { openModal } = useUiStore();
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-only"
        aria-label="Abrir menu"
        onClick={onOpenMenu}
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
  );
}
