import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { RoleCards } from "@/features/users/components/role-cards.jsx";
import { UsersTable } from "@/features/users/components/users-table.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

export function EquipeRoute() {
  const { users, setUsers } = useDemoStore();
  const { openModal, notify } = useUiStore();
  const toggleUser = (u) => {
    setUsers(
      users.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)),
    );
    notify(
      u.active
        ? "Usuário desativado na demonstração."
        : "Usuário reativado na demonstração.",
    );
  };
  return (
    <>
      <PageHeading
        title={routeTitle("equipe")}
        subtitle={routeSubtitle("equipe")}
        actions={
          <Button icon="plus" onClick={() => openModal({ type: "user" })}>
            Novo usuário
          </Button>
        }
      />
      <div className="notice">
        <Icon name="shield" />
        <span>
          Perfis sugeridos para validação: Administrador, Gerente e Operador. A
          autorização real será aplicada no servidor.
        </span>
      </div>
      <UsersTable users={users} onToggle={toggleUser} />
      <RoleCards />
    </>
  );
}
