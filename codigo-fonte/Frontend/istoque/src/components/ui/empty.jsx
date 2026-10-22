import React from "react";
import { Icon } from "./icon.jsx";
import { Mascot } from "./mascot.jsx";

// mascot troca o ícone de busca pelo mascote de uma caixa, que pisca devagar.
// Só para o "ainda não há nada" (ex.: nenhum produto cadastrado); o "nenhum
// resultado" de um filtro e os erros ficam com o ícone.
export function Empty({
  title = "Nenhum resultado",
  text = "Tente outro termo ou remova os filtros.",
  action,
  mascot = false,
}) {
  return (
    <div className="empty">
      {mascot ? (
        <Mascot variant="uma" mode="vazio" />
      ) : (
        <Icon name="search" size={36} />
      )}
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}
