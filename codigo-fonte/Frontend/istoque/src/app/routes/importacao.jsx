import React from "react";
import { Empty } from "@/components/ui/empty.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { InvoiceImport } from "@/features/imports/components/invoice-import.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";
import { plural } from "@/utils/format.js";

export function ImportacaoRoute() {
  const { products, registerEntries } = useDemoStore();
  const { session } = useSession();
  const { notify } = useUiStore();
  const applyInvoice = (rows) => {
    registerEntries(rows, "Importação simulada • Nota 00124");
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
