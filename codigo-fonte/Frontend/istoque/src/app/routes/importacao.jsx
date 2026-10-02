import React from "react";
import { Empty } from "@/components/ui/empty.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { InvoiceImport } from "@/features/imports/components/invoice-import.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { plural, round } from "@/utils/format.js";
import { MOVEMENT_TYPES } from "@/utils/inventory.js";

export function ImportacaoRoute() {
  const { products, setProducts, addHistory } = useDemoStore();
  const { session } = useSession();
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
      rows.map((r) => {
        const p = products.find((p) => p.id === r.id);
        return {
          type: MOVEMENT_TYPES.entry,
          productId: p.id,
          product: p.name,
          qty: r.qty,
          unit: p.unit,
          reason: "Importação simulada • Nota 00124",
        };
      }),
    );
    notify(
      `${plural(rows.length, "item adicionado", "itens adicionados")} ao estoque de demonstração.`,
    );
    navigate("movimentacoes");
  };
  return (
    <>
      <PageHeading
        title={routeTitle("importacao")}
        subtitle={routeSubtitle("importacao")}
      />
      {session ? (
        // a nota de exemplo usa os produtos da demonstração
        <Empty
          title="Importação ainda não disponível"
          text="A importação de nota é uma simulação com os produtos da demonstração."
        />
      ) : (
        <InvoiceImport products={products} onApply={applyInvoice} />
      )}
    </>
  );
}
