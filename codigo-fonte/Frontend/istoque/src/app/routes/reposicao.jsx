import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { ReplenishmentList } from "@/features/stock/components/replenishment-list.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { isLow } from "@/utils/inventory.js";

export function ReposicaoRoute() {
  const { products } = useDemoStore();
  const { openModal } = useUiStore();
  const low = products.filter(isLow);
  return (
    <>
      <PageHeading
        title={routeTitle("reposicao")}
        subtitle={routeSubtitle("reposicao")}
      />
      <div className="notice">
        <Icon name="alert" />
        <span>
          {low.length} produtos no mínimo ou abaixo dele. A sugestão completa o
          saldo até o máximo cadastrado.
        </span>
      </div>
      <ReplenishmentList
        low={low}
        onRegisterEntry={(p) => openModal({ type: "movement", product: p })}
      />
      <div className="info-card">
        <Icon name="recipe" size={28} />
        <div>
          <h3>Compras que acompanham a produção</h3>
          <p>
            A cada produção, o saldo e as sugestões são recalculados. A lista é
            um apoio de planejamento; não envia pedidos a fornecedores.
          </p>
        </div>
      </div>
    </>
  );
}
