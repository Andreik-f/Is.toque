import React from "react";
import { fmt } from "@/utils/format.js";
import { isLow } from "@/utils/inventory.js";

export function StockMeter({ product }) {
  return (
    <div className="stock-meter">
      <div>
        <strong>
          {fmt(product.stock)} <small>{product.unit}</small>
        </strong>
        <span>
          Mín. {fmt(product.min)} {product.unit}
        </span>
      </div>
      <div className="meter-track">
        <i
          style={{
            width: Math.min(100, (product.stock / product.max) * 100) + "%",
            background: isLow(product) ? "var(--amber)" : "var(--teal)",
          }}
        />
      </div>
    </div>
  );
}
