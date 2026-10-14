import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Field } from "@/components/ui/field.jsx";
import { Modal } from "@/components/ui/modal.jsx";
import { ROLES } from "../utils/roles.js";

export function UserModal({ onClose, onSave }) {
  return (
    <Modal
      title="Novo usuário"
      subtitle="Cadastro ilustrativo, sem envio de convite."
      onClose={onClose}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.target);
          onSave({
            id: Date.now(),
            name: f.get("name"),
            email: f.get("email"),
            role: f.get("role"),
            active: true,
          });
        }}
      >
        <Field label="Nome completo" name="name" required />
        <Field label="E-mail" name="email" type="email" required />
        <Field label="Perfil">
          <select name="role">
            {/* do perfil com menos acesso ao com mais; o primeiro é o padrão */}
            {[...ROLES].reverse().map((r) => (
              <option key={r.name}>{r.name}</option>
            ))}
          </select>
        </Field>
        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Adicionar usuário</Button>
        </div>
      </form>
    </Modal>
  );
}
