import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { MovementsTable } from "@/features/stock/components/movements-table.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { ALL, filterMovements } from "@/utils/filters.js";
import { MOVEMENT_TYPES } from "@/utils/inventory.js";

export function MovimentacoesRoute() {
  const { history } = useDemoStore();
  const { openModal } = useUiStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  return (
    <>
      <PageHeading
        title={routeTitle("movimentacoes")}
        subtitle={routeSubtitle("movimentacoes")}
        actions={
          <Button icon="plus" onClick={() => openModal({ type: "movement" })}>
            Nova movimentação
          </Button>
        }
      />
      <div className="notice">
        <Icon name="shield" />
        <span>
          Rastreabilidade em cada movimento. Ajustes e perdas sempre incluem um
          motivo.
        </span>
      </div>
      <div className="filter-bar">
        <label className="search">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto ou motivo..."
            aria-label="Buscar movimentação"
          />
        </label>
        <select
          aria-label="Tipo de movimentação"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {[ALL, ...Object.values(MOVEMENT_TYPES)].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <section className="panel">
        <MovementsTable
          rows={filterMovements(history, { search, type: category })}
        />
      </section>
    </>
  );
}
