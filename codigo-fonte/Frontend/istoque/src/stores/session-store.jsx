import React, { createContext, useContext, useState } from "react";

// Usuário logado, no formato da resposta do login (id, nome, email, perfil,
// empresaId e nomeEmpresa). Fica guardado no navegador para a sessão
// continuar ao recarregar a página. Ainda não há token: a autenticação real
// das rotas da API entra com o HT001.
const SessionContext = createContext(null);
const STORAGE_KEY = "istoque.sessao";

function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return session?.empresaId ? session : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // sem acesso ao armazenamento do navegador: a sessão vale só nesta aba
  }
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const value = {
    session,
    signIn: (next) => {
      writeSession(next);
      setSession(next);
    },
    signOut: () => {
      writeSession(null);
      setSession(null);
    },
  };
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
