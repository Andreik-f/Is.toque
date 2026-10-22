import React, { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { DEMO_PROFILE } from "@/config/demo.js";
import { LOCAL_ONLY_ROUTES } from "@/config/paths.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { isExpiringSoon } from "@/utils/inventory.js";
import { MobileNav } from "./mobile-nav.jsx";
import { Sidebar } from "./sidebar.jsx";
import { Topbar } from "./topbar.jsx";

// Estrutura comum das telas internas: menu lateral, barra do topo, rodapé e
// menu inferior do celular. O conteúdo da rota entra em `children`; avisos e
// modais entram em `overlays`. Com login, mostra a empresa e o usuário da
// sessão; sem login, os da demonstração.
export function AppLayout({ route, children, overlays }) {
  const { products, lowStock, today } = useDemoStore();
  const { session } = useSession();
  const [mobileMenu, setMobileMenu] = useState(false);
  useEffect(() => setMobileMenu(false), [route]);
  const hasAlerts =
    lowStock.length > 0 || products.some((p) => isExpiringSoon(p, today));
  const profile = {
    company: session?.nomeEmpresa ?? DEMO_PROFILE.company,
    userName: session?.nome ?? DEMO_PROFILE.userName,
    role: session?.perfil ?? DEMO_PROFILE.role,
  };
  return (
    <div className="app">
      <Sidebar
        route={route}
        profile={profile}
        open={mobileMenu}
        onNavigate={() => setMobileMenu(false)}
        lowCount={lowStock.length}
      />
      {/* sempre montado, para o fade de saída: fechado fica visibility:
          hidden (sem clique nem foco) e a classe "on" o mostra */}
      <button
        className={"scrim" + (mobileMenu ? " on" : "")}
        aria-label="Fechar menu"
        onClick={() => setMobileMenu(false)}
      />
      <div className="shell">
        <Topbar
          route={route}
          userName={profile.userName}
          hasAlerts={hasAlerts}
          lowCount={lowStock.length}
          onOpenMenu={() => setMobileMenu(true)}
        />
        <main>
          {session && LOCAL_ONLY_ROUTES.includes(route) && (
            <div className="notice">
              <Icon name="alert" />
              <span>
                Esta tela ainda não grava no servidor: o que você registrar aqui
                vale até recarregar a página.
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
        <MobileNav route={route} />
      </div>
      {overlays}
    </div>
  );
}
