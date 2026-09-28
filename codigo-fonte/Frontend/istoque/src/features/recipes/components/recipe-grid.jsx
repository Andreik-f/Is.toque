import React from "react";
import { FoodArt } from "@/components/ui/food-art.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { bottleneck, capacity } from "@/utils/inventory.js";

export function RecipeGrid({ recipes, products, onOpen }) {
  return (
    <div className="recipe-grid">
      {recipes.map((r) => (
        <button className="recipe-card" key={r.id} onClick={() => onOpen(r)}>
          <div className="recipe-art">
            <FoodArt kind={r.art} />
            <span className="recipe-time">
              <Icon name="clock" size={14} />
              {r.time} min
            </span>
          </div>
          <div className="recipe-content">
            <span className="eyebrow">
              {r.category} • {r.ingredients.length} ingredientes
            </span>
            <h3>{r.name}</h3>
            <div className="capacity">
              <strong>{capacity(r, products)}</strong>
              <span>
                porções disponíveis
                <br />
                <small>com o estoque atual</small>
              </span>
              <Icon name="arrow" />
            </div>
            <p className="recipe-limit">
              <Icon name="alert" size={15} />
              {bottleneck(r, products).product.name} limita o preparo
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
