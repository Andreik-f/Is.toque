import React from "react";
import { useSession } from "@/stores/session-store.jsx";

// Sem `eyebrow`, mostra o nome da empresa logada (ou o da demonstração).
export function PageHeading({ title, subtitle, actions = null, eyebrow }) {
  const { session } = useSession();
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          {eyebrow ?? (session?.nomeEmpresa ?? "Cozinha da Casa").toUpperCase()}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{actions}</div>
    </div>
  );
}
