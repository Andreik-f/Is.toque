import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { ROLES } from "../utils/roles.js";

export function RoleCards() {
  return (
    <section className="roles-grid">
      {ROLES.map((r) => (
        <div className="panel role-card" key={r.name}>
          <Icon name="shield" />
          <h3>{r.name}</h3>
          <p>{r.description}</p>
        </div>
      ))}
    </section>
  );
}
