import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { routeTitle } from "@/config/paths.js";
import { useChangeCount } from "@/hooks/use-change-count.js";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { initials } from "@/utils/format.js";

// Barra do topo: menu do celular, caminho da tela, estado da conexão e sino
// de alertas. hasAlerts acende o ponto do sino; lowCount (produtos no mínimo)
// faz o sino balançar quando sobe.
export function Topbar({ route, userName, hasAlerts, lowCount, onOpenMenu }) {
  const { session } = useSession();
  const { openModal } = useUiStore();
  // o título troca com fade, mas só quando a tela muda (não ao abrir)
  const titleChanges = useChangeCount(route);
  // o sino só balança quando entra alerta novo (o número sobe); o ponto só
  // faz pop se aparece depois da abertura
  // as keys levam prefixo: o sino e o ponto são irmãos, e as duas contagens
  // começam em 0, então keys iguais fariam o React deixar o sino antigo na tela
  const rings = useChangeCount(lowCount, (before, now) => now > before);
  const dotChanges = useChangeCount(hasAlerts);
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
        <span key={titleChanges} className={titleChanges ? "swap" : undefined}>
          {routeTitle(route)}
        </span>
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
          <Icon
            key={"bell" + rings}
            name="bell"
            className={rings ? "ring" : undefined}
          />
          {hasAlerts && (
            <i
              key={"dot" + dotChanges}
              className={dotChanges ? "pop" : undefined}
            />
          )}
        </button>
        <div className="avatar light">{initials(userName)}</div>
      </div>
    </header>
  );
}
