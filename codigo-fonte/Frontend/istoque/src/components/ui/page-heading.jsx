import React from "react";

export function PageHeading({
  title,
  subtitle,
  actions = null,
  eyebrow = "COZINHA DA CASA",
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="heading-actions">{actions}</div>
    </div>
  );
}
