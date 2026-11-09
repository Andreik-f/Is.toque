import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { useApiData } from "@/hooks/use-api-data.js";
import { useSession } from "@/stores/session-store.jsx";
import { temPermissao } from "@/utils/permissions.js";
import { getCompany } from "../api/company.js";
import { telefoneConfirmado } from "../utils/company-api.js";

// Aviso discreto para o administrador. linkToSettings leva à tela onde o
// telefone é confirmado (no painel); na própria tela não faz sentido.
export function UnconfirmedPhoneNotice({ linkToSettings = false }) {
  return (
    <div className="notice" role="status">
      <Icon name="alert" />
      <span>
        Sem telefone confirmado, a recuperação de senha por SMS não funciona.
        {linkToSettings && (
          <>
            {" "}
            <a href="#empresa">Confirmar telefone</a>
          </>
        )}
      </span>
    </div>
  );
}

// No painel: só para quem pode confirmar o telefone e ainda não o confirmou.
// Enquanto carrega, ou se a consulta falhar, não mostra nada: é um lembrete e
// não pode atrapalhar a tela.
export function PhoneNoticeGate() {
  const { session } = useSession();
  const permitido = temPermissao(session, "empresa.configurar");
  const { data } = useApiData(getCompany, {
    enabled: permitido,
    deps: [session?.id],
  });
  if (!permitido || !data || telefoneConfirmado(data)) return null;
  return <UnconfirmedPhoneNotice linkToSettings />;
}
