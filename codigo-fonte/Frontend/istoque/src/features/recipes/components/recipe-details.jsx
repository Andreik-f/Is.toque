import React from "react";
import { ProductVisual } from "@/components/product-visual.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { FoodArt } from "@/components/ui/food-art.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { fmt } from "@/utils/format.js";
import { bottleneck, capacity } from "@/utils/inventory.js";

// Ficha técnica: ingredientes por porção e capacidade atual de produção.
export function RecipeDetails({
  recipe,
  products,
  onEdit,
  onProduce,
  onPlanReplenishment,
}) {
  return (
    <>
      <div className="recipe-detail-heading">
        <div className="recipe-detail-art">
          <FoodArt kind={recipe.art} />
        </div>
        <div>
          <Badge tone="success">Ficha técnica ativa</Badge>
          <h2>{recipe.name}</h2>
          <p>
            {recipe.category} • Rendimento: {recipe.portion}
          </p>
          <span className="time-detail">
            <Icon name="clock" size={16} />
            {recipe.time} minutos de preparo
          </span>
        </div>
        <Button variant="secondary" icon="edit" onClick={onEdit}>
          Editar ficha
        </Button>
      </div>
      <div className="recipe-detail-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Ingredientes por porção</h2>
              <p>As quantidades respeitam a unidade de cada produto.</p>
            </div>
            <Badge>{recipe.ingredients.length} ingredientes</Badge>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Ingrediente</th>
                  <th>Por porção</th>
                  <th>Em estoque</th>
                  <th>Capacidade</th>
                </tr>
              </thead>
              <tbody>
                {recipe.ingredients.map((i) => {
                  const p = products.find((p) => p.id === i.id),
                    limit = bottleneck(recipe, products).id === i.id;
                  return (
                    <tr key={i.id} className={limit ? "limiting" : ""}>
                      <td>
                        <div className="ingredient-name">
                          <div className="mini-art">
                            <ProductVisual product={p} />
                          </div>
                          <div>
                            <strong>{p.name}</strong>
                            {limit && <small>Ingrediente limitante</small>}
                          </div>
                        </div>
                      </td>
                      <td>
                        {fmt(i.qty)} {p.unit}
                      </td>
                      <td>
                        {fmt(p.stock)} {p.unit}
                      </td>
                      <td>
                        <strong>
                          {Math.floor((p.stock + 1e-9) / i.qty)} porções
                        </strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="table-note">
            <Icon name="shield" size={17} />
            Salvar esta ficha não altera o estoque.
          </div>
        </section>
        <aside className="capacity-panel">
          <span className="eyebrow">CAPACIDADE ATUAL</span>
          <strong className="big-number">{capacity(recipe, products)}</strong>
          <h3>porções disponíveis</h3>
          <p>O ingrediente com menor rendimento define o limite da receita.</p>
          <div className="limiting-note">
            <Icon name="alert" />
            <span>
              Limitante
              <strong>{bottleneck(recipe, products).product.name}</strong>
            </span>
          </div>
          <Button variant="accent" icon="plus" onClick={onProduce}>
            Registrar produção
          </Button>
          <button className="text-button" onClick={onPlanReplenishment}>
            Planejar reposição <Icon name="arrow" size={16} />
          </button>
        </aside>
      </div>
    </>
  );
}
