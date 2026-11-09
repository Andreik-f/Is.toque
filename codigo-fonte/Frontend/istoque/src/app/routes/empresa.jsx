import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { getCompany } from "@/features/company/api/company.js";
import { CompanyPhonePanel } from "@/features/company/components/company-phone-panel.jsx";
import { useApiData } from "@/hooks/use-api-data.js";
import { useSession } from "@/stores/session-store.jsx";
import { temPermissao } from "@/utils/permissions.js";

export function EmpresaRoute() {
  const { session } = useSession();
  const permitido = temPermissao(session, "empresa.configurar");
  const { data, loading, error, reload } = useApiData(getCompany, {
    enabled: permitido,
    deps: [session?.id],
  });
  return (
    <>
      <PageHeading
        title={routeTitle("empresa")}
        subtitle={routeSubtitle("empresa")}
      />
      {!session ? (
        <div className="notice">
          <Icon name="shield" />
          <span>
            Entre na sua conta para ver as configurações da empresa. A
            demonstração não grava dados.
          </span>
        </div>
      ) : !permitido ? (
        <div className="notice danger" role="alert">
          <Icon name="alert" />
          <span>
            Seu perfil não permite alterar as configurações da empresa.
          </span>
        </div>
      ) : error && !data ? (
        <div className="notice danger" role="alert">
          <Icon name="alert" />
          <span>{error}</span>
          <Button variant="secondary" onClick={reload}>
            Tentar de novo
          </Button>
        </div>
      ) : data ? (
        <CompanyPhonePanel initial={data} />
      ) : (
        loading && <p role="status">Carregando os dados da empresa...</p>
      )}
    </>
  );
}
