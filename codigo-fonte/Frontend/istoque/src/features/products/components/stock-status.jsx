import React from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { isLow } from "@/utils/inventory.js";

export function StockStatus({ product }) {
  return (
    <Badge
      tone={
        product.stock === 0 ? "danger" : isLow(product) ? "warning" : "success"
      }
    >
      {product.stock === 0
        ? "Sem estoque"
        : isLow(product)
          ? "Estoque baixo"
          : "Em dia"}
    </Badge>
  );
}
