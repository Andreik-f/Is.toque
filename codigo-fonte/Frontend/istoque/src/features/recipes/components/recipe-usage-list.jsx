import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { plural } from "@/utils/format.js";
import { capacity } from "@/utils/inventory.js";

// Receitas que usam um produto, com a capacidade atual de cada uma.
export function RecipeUsageList({ product, recipes, products, onOpen }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h3>Usado nas receitas</h3>
      </div>
      {recipes
        .filter((r) => r.ingredients.some((i) => i.id === product.id))
        .map((r) => {
          const portions = capacity(r, products);
          return (
            <button className="list-link" key={r.id} onClick={() => onOpen(r)}>
              <span>
                {r.name}
                <small>
                  {plural(portions, "porção disponível", "porções disponíveis")}
                </small>
              </span>
              <Icon name="chevron" />
            </button>
          );
        })}
    </section>
  );
}
