import React from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { fmt, formatDate } from "@/utils/format.js";
import { MOVEMENT_TYPES } from "@/utils/inventory.js";

const { entry, loss, adjustment } = MOVEMENT_TYPES;

export function MovementsTable({ rows, compact = false }) {
  return rows.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Produto / registro</th>
            <th>Movimento</th>
            <th>Quantidade</th>
            {!compact && <th>Responsável</th>}
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((h) => (
            <tr key={h.id}>
              <td>
                <strong>{h.product}</strong>
                <small>{h.reason}</small>
              </td>
              <td>
                <Badge
                  tone={
                    h.type === entry
                      ? "success"
                      : h.type === loss
                        ? "danger"
                        : "neutral"
                  }
                >
                  {h.type}
                </Badge>
              </td>
              <td className="number">
                {h.type === entry ? "+" : h.type === adjustment ? "" : "−"}
                {fmt(h.qty)} {h.unit}
              </td>
              {!compact && <td>{h.user}</td>}
              <td>{formatDate(h.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title="Nenhuma movimentação encontrada" />
  );
}
