import React from "react";
import { FoodArt } from "@/components/ui/food-art.jsx";

// Foto do produto ou, sem foto, a ilustração padrão. Usado por produtos e
// receitas, por isso fica entre os componentes compartilhados.
export function ProductVisual({ product }) {
  return product.photo ? (
    <img
      className="product-photo"
      src={product.photo}
      alt={`Foto de ${product.name}`}
    />
  ) : (
    <FoodArt kind={product.art || "jar"} />
  );
}
