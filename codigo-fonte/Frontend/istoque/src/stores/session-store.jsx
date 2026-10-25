import React, {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { setAuthHandlers } from "@/lib/api-client.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { readStoredSession, writeStoredSession } from "./session-storage.js";
import { useUiStore } from "./ui-store.jsx";

const SessionContext = createContext(null);
export const SESSION_EXPIRED_MESSAGE = "Sua sessão expirou. Entre novamente.";

function readInitial() {
  const stored = readStoredSession(localStorage);
  if (stored.expired) navigate("login");
  return stored;
}

export function SessionProvider({ children }) {
  const [initial] = useState(readInitial);
  const [session, setSession] = useState(initial.session);
  const [notice, setNotice] = useState(
    initial.expired ? SESSION_EXPIRED_MESSAGE : null,
  );
  const sessionRef = useRef(initial.session);
  const { closeModal } = useUiStore();

  function signIn(next) {
    sessionRef.current = next;
    writeStoredSession(localStorage, next);
    setSession(next);
    setNotice(null);
  }

  function signOut() {
    sessionRef.current = null;
    writeStoredSession(localStorage, null);
    setSession(null);
    setNotice(null);
  }

  function expireSession(token) {
    if (!sessionRef.current || sessionRef.current.token !== token) return;
    sessionRef.current = null;
    writeStoredSession(localStorage, null);
    setSession(null);
    setNotice(SESSION_EXPIRED_MESSAGE);
    closeModal();
    navigate("login");
  }

  useLayoutEffect(() => {
    if (initial.expired) writeStoredSession(localStorage, null);
  }, [initial]);

  useLayoutEffect(() => {
    setAuthHandlers({
      getToken: () => sessionRef.current?.token ?? null,
      onUnauthorized: expireSession,
    });
  });

  const value = { session, notice, signIn, signOut };
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
