import React from "react";
import { ProductVisual } from "@/components/product-visual.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { formatDate } from "@/utils/format.js";
import { StockMeter } from "./stock-meter.jsx";
import { StockStatus } from "./stock-status.jsx";

export function ProductGrid({ products, onOpen }) {
  return (
    <div className="product-grid">
      {products.map((p) => (
        <button className="product-card" key={p.id} onClick={() => onOpen(p)}>
          <div className={"product-art " + p.art}>
            <ProductVisual product={p} />
            <span className="product-category">{p.category}</span>
          </div>
          <div className="product-content">
            <StockStatus product={p} />
            <h3>{p.name}</h3>
            <StockMeter product={p} />
            <div className="product-foot">
              <span>
                {p.expiry ? "Validade " + formatDate(p.expiry) : "Sem validade"}
              </span>
              <Icon name="arrow" size={18} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
