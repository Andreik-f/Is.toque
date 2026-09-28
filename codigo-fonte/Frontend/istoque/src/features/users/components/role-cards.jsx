import React from "react";
import { Icon } from "@/components/ui/icon.jsx";

const roles = [
  ["Administrador", "Gerencia empresa, equipe, perfis e toda a operação."],
  ["Gerente", "Gerencia estoque, fichas técnicas, produção e relatórios."],
  [
    "Operador",
    "Consulta estoque e receitas; registra entradas, saídas e produção.",
  ],
];

export function RoleCards() {
  return (
    <section className="roles-grid">
      {roles.map(([r, d]) => (
        <div className="panel role-card" key={r}>
          <Icon name="shield" />
          <h3>{r}</h3>
          <p>{d}</p>
        </div>
      ))}
    </section>
  );
}
