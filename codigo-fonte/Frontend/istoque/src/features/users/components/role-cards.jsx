import React from "react";
import { Icon } from "@/components/ui/icon.jsx";

// Mesmos nomes dos perfis padrão da API. Quando o front for ligado à API,
// a lista deve vir de GET /api/perfis em vez de ficar fixa aqui.
const roles = [
  ["Administrador", "Gerencia empresa, equipe, perfis e toda a operação."],
  ["Gerente", "Gerencia estoque, fichas técnicas, produção e relatórios."],
  [
    "Funcionário",
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
