import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { downloadCSV } from "@/utils/csv.js";
import { fmt } from "@/utils/format.js";
import { purchaseSuggestion } from "@/utils/inventory.js";

// Lista de compras sugerida: completa o saldo de cada produto até o máximo.
export function ReplenishmentList({ low, onRegisterEntry }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <h2>Lista de compras sugerida</h2>
          <p>Revise as quantidades antes de comprar.</p>
        </div>
        <Button
          variant="secondary"
          icon="download"
          onClick={() =>
            downloadCSV("reposicao.csv", [
              ["Produto", "Saldo", "Mínimo", "Máximo", "Comprar", "Unidade"],
              ...low.map((p) => [
                p.name,
                p.stock,
                p.min,
                p.max ?? "",
                purchaseSuggestion(p),
                p.unit,
              ]),
            ])
          }
        >
          Exportar lista
        </Button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Ingrediente</th>
              <th>Saldo atual</th>
              <th>Mínimo</th>
              <th>Sugestão de compra</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {low.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <small>{p.category}</small>
                </td>
                <td>
                  {fmt(p.stock)} {p.unit}
                </td>
                <td>
                  {fmt(p.min)} {p.unit}
                </td>
                <td>
                  <span className="purchase-qty">
                    {fmt(purchaseSuggestion(p))} {p.unit}
                  </span>
                </td>
                <td>
                  <Button
                    variant="secondary"
                    onClick={() => onRegisterEntry(p)}
                  >
                    Registrar entrada
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {low.length === 0 && (
        <Empty
          title="Estoque abastecido"
          text="Nenhum produto está no mínimo ou abaixo dele."
        />
      )}
    </section>
  );
}
