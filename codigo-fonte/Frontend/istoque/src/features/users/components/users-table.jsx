import React from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { initials } from "@/utils/format.js";

// currentUserId: o usuário logado, que não pode desativar a si mesmo.
export function UsersTable({ users, currentUserId, onToggle }) {
  return (
    <section className="panel">
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Usuário</th>
              <th>Perfil</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="user-cell">
                    <span className="avatar light">{initials(u.name)}</span>
                    <div>
                      <strong>{u.name}</strong>
                      <small>{u.email}</small>
                    </div>
                  </div>
                </td>
                <td>{u.role}</td>
                <td>
                  <Badge tone={u.active ? "success" : "neutral"}>
                    {u.active ? "Ativo" : "Desativado"}
                  </Badge>
                </td>
                <td>
                  {u.id === currentUserId ? (
                    <small>Seu usuário</small>
                  ) : (
                    <button className="text-button" onClick={() => onToggle(u)}>
                      {u.active ? "Desativar" : "Reativar"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
