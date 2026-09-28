import React from "react";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { InvoiceImport } from "@/features/imports/components/invoice-import.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { round } from "@/utils/format.js";

export function ImportacaoRoute() {
  const { products, setProducts, addHistory } = useDemoStore();
  const { notify } = useUiStore();
  const applyInvoice = (rows) => {
    setProducts(
      products.map((p) => {
        const n = rows
          .filter((r) => r.id === p.id)
          .reduce((s, r) => s + r.qty, 0);
        return { ...p, stock: round(p.stock + n) };
      }),
    );
    addHistory(
      rows.map((r) => ({
        type: "Entrada",
        product: products.find((p) => p.id === r.id).name,
        qty: r.qty,
        unit: products.find((p) => p.id === r.id).unit,
        reason: "Importação simulada • Nota 00124",
      })),
    );
    notify("3 itens adicionados ao estoque de demonstração.");
    navigate("movimentacoes");
  };
  return (
    <>
      <PageHeading
        title={routeTitle("importacao")}
        subtitle={routeSubtitle("importacao")}
      />
      <InvoiceImport products={products} onApply={applyInvoice} />
    </>
  );
}
