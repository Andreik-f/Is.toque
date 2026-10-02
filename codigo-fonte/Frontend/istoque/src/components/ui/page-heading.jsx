import React from "react";
import { DEMO_PROFILE } from "@/config/demo.js";
import { useSession } from "@/stores/session-store.jsx";

// Sem `eyebrow`, mostra o nome da empresa logada (ou o da demonstração).
export function PageHeading({ title, subtitle, actions = null, eyebrow }) {
  const { session } = useSession();
  const company = session?.nomeEmpresa ?? DEMO_PROFILE.company;
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow ?? company.toUpperCase()}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{actions}</div>
    </div>
  );
}
