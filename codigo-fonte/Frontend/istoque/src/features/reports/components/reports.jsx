import React, { useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { Stat } from "@/components/ui/stat.jsx";
import { downloadCSV } from "@/utils/csv.js";
import { PERIODS, inPeriod } from "@/utils/filters.js";
import { fmt } from "@/utils/format.js";
import { MOVEMENT_TYPES, isLow } from "@/utils/inventory.js";

const { entry, exit, loss, adjustment, production } = MOVEMENT_TYPES;

// today: o "hoje" dos filtros de período. demoDate: a data de referência da
// demonstração (com login, null).
export function Reports({ history, products, today, demoDate }) {
  const [period, setPeriod] = useState(PERIODS[0]);
  const rows = history.filter((h) => inPeriod(h.date, period, today));
  return (
    <>
      <div className="filter-bar">
        <div className="tabs">
          {PERIODS.map((p) => (
            <button
              key={p}
              className={period === p ? "selected" : ""}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
        <Button
          variant="secondary"
          icon="download"
          onClick={() =>
            downloadCSV("movimentacoes.csv", [
              [
                "Data",
                "Produto",
                "Tipo",
                "Quantidade",
                "Unidade",
                "Responsável",
                "Motivo",
              ],
              ...rows.map((h) => [
                h.date,
                h.product,
                h.type,
                h.qty,
                h.unit,
                h.user,
                h.reason,
              ]),
            ])
          }
        >
          Exportar CSV
        </Button>
      </div>
      <div className="notice">
        <Icon name="chart" />
        <span>
          Extensão proposta: análise por período.
          {demoDate &&
            ` A demonstração usa ${demoDate} como data de referência.`}
        </span>
      </div>
      <section className="stats">
        <Stat
          icon="arrows"
          value={rows.length}
          label="Registros no período"
          detail="Entradas, saídas e ajustes"
        />
        <Stat
          icon="plus"
          value={rows.filter((h) => h.type === entry).length}
          label="Entradas"
          detail="Registros de recebimento"
        />
        <Stat
          icon="alert"
          value={rows.filter((h) => h.type === loss).length}
          label="Perdas registradas"
          detail="Ocorrências com motivo"
          tone="danger"
        />
        <Stat
          icon="box"
          value={products.filter(isLow).length}
          label="Produtos para repor"
          detail="Posição atual do estoque"
          tone="warning"
        />
      </section>
      <div className="reports-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Movimentações por tipo</h2>
              <p>Quantidade de registros no período selecionado.</p>
            </div>
          </div>
          <div className="bar-chart">
            {[entry, exit, production, loss, adjustment].map((t) => {
              const n = rows.filter((h) => h.type === t).length;
              return (
                <div key={t}>
                  <span>{t}</span>
                  <div className="chart-track">
                    <i
                      style={{
                        width:
                          (rows.length ? (n / rows.length) * 100 : 0) + "%",
                        background:
                          t === loss ? "var(--coral)" : "var(--teal)",
                      }}
                    />
                  </div>
                  <strong>{n}</strong>
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Perdas por ingrediente</h2>
              <p>Unidades diferentes permanecem separadas.</p>
            </div>
          </div>
          {rows.filter((h) => h.type === loss).length ? (
            rows
              .filter((h) => h.type === loss)
              .map((h) => (
                <div className="list-link" key={h.id}>
                  <span>
                    {h.product}
                    <small>{h.reason}</small>
                  </span>
                  <strong>
                    {fmt(h.qty)} {h.unit}
                  </strong>
                </div>
              ))
          ) : (
            <Empty
              title="Nenhuma perda no período"
              text="Os registros aparecerão aqui."
            />
          )}
        </section>
      </div>
    </>
  );
}
