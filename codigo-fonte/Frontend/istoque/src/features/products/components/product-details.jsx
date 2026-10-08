import React from "react";
import { ProductVisual } from "@/components/product-visual.jsx";
import { Button } from "@/components/ui/button.jsx";
import { fmt, formatDate } from "@/utils/format.js";
import { controlsExpiry } from "@/utils/inventory.js";
import { productTypeLabel } from "../utils/product-types.js";
import { StockMeter } from "./stock-meter.jsx";
import { StockStatus } from "./stock-status.jsx";

export function ProductDetails({ product, onMove, onEdit }) {
  return (
    <section className="panel product-detail">
      <div className="detail-art">
        <ProductVisual product={product} />
      </div>
      <div className="detail-info">
        <StockStatus product={product} />
        <h2>{product.name}</h2>
        <p>
          {product.category} • {productTypeLabel(product.type)} • Unidade de
          controle: {product.unit}
        </p>
        <StockMeter product={product} />
        <dl>
          <div>
            <dt>Estoque máximo</dt>
            <dd>
              {product.max == null
                ? "Não definido"
                : `${fmt(product.max)} ${product.unit}`}
            </dd>
          </div>
          <div>
            <dt>Validade do lote mais próximo</dt>
            <dd>
              {product.expiry
                ? formatDate(product.expiry)
                : controlsExpiry(product)
                  ? "Informada na próxima entrada"
                  : "Não controla validade"}
            </dd>
          </div>
        </dl>
        <Button icon="arrows" onClick={onMove}>
          Registrar movimentação
        </Button>
        <Button variant="secondary" icon="edit" onClick={onEdit}>
          Editar produto
        </Button>
      </div>
    </section>
  );
}
