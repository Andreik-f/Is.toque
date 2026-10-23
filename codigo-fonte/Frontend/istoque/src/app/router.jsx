import React, { Suspense, lazy } from "react";
import { AppLayout } from "@/components/layouts/app-layout.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { Toast } from "@/components/ui/toast.jsx";
import {
  AUTH_ROUTES,
  routeSubtitle,
  routeTitle,
  showsLanding,
} from "@/config/paths.js";
import { useHashRoute } from "@/hooks/use-hash-route.js";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { AppModals } from "./modals.jsx";
import { AuthRoute } from "./routes/auth.jsx";
import { DashboardRoute } from "./routes/dashboard.jsx";
import { EquipeRoute } from "./routes/equipe.jsx";
import { EstoqueRoute } from "./routes/estoque.jsx";
import { FluxosRoute } from "./routes/fluxos.jsx";
import { ImportacaoRoute } from "./routes/importacao.jsx";
import { MovimentacoesRoute } from "./routes/movimentacoes.jsx";
import { ProdutoRoute } from "./routes/produto.jsx";
import { ReceitaRoute } from "./routes/receita.jsx";
import { ReceitasRoute } from "./routes/receitas.jsx";
import { RelatoriosRoute } from "./routes/relatorios.jsx";
import { ReposicaoRoute } from "./routes/reposicao.jsx";

// A página inicial só é baixada quando abre, para não pesar no sistema.
const LandingRoute = lazy(() =>
  import("./routes/landing.jsx").then((m) => ({ default: m.LandingRoute })),
);

// Tela de cada rota (#rota na URL). Produto e receita recebem o id da URL
// (#produto/12) em `id`.
const pages = {
  dashboard: DashboardRoute,
  estoque: EstoqueRoute,
  produto: ProdutoRoute,
  movimentacoes: MovimentacoesRoute,
  receitas: ReceitasRoute,
  receita: ReceitaRoute,
  reposicao: ReposicaoRoute,
  relatorios: RelatoriosRoute,
  equipe: EquipeRoute,
  importacao: ImportacaoRoute,
  fluxos: FluxosRoute,
};

export function AppRouter() {
  const { route, id } = useHashRoute();
  const { toast, dismissToast } = useUiStore();
  const { session } = useSession();
  // o hash cru distingue a URL sem hash de #dashboard; useHashRoute já
  // redesenha a cada troca, então location.hash está em dia aqui
  if (showsLanding(location.hash, Boolean(session)))
    return (
      <Suspense fallback={null}>
        <LandingRoute />
      </Suspense>
    );
  if (AUTH_ROUTES.includes(route)) return <AuthRoute route={route} />;
  const Page = pages[route];
  return (
    <AppLayout
      route={route}
      overlays={
        <>
          <Toast message={toast} onClose={dismissToast} />
          <AppModals />
        </>
      }
    >
      {/* a key por rota refaz a entrada a cada troca de tela; fica aqui e não
          no <main>, que é do layout e não muda */}
      <div className="route-enter" key={route}>
        {Page ? (
          <Page id={id} />
        ) : (
          <PageHeading
            title={routeTitle(route)}
            subtitle={routeSubtitle(route)}
          />
        )}
      </div>
    </AppLayout>
  );
}
