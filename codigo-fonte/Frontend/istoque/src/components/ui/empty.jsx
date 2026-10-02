import React from "react";
import { Icon } from "./icon.jsx";

export function Empty({
  title = "Nenhum resultado",
  text = "Tente outro termo ou remova os filtros.",
  action,
}) {
  return (
    <div className="empty">
      <Icon name="search" size={36} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
