import React from "react";
import { AuthScreen } from "@/features/auth/components/auth-screen.jsx";
import { navigate } from "@/hooks/use-hash-route.js";
import { useSession } from "@/stores/session-store.jsx";

// #login, #cadastro e #recuperar abrem fora do layout principal. Depois do
// login ou do cadastro, a sessão é guardada e o painel abre com os dados da
// empresa.
export function AuthRoute({ route }) {
  const { signIn, notice } = useSession();
  return (
    <AuthScreen
      route={route}
      go={navigate}
      notice={notice}
      onAuthenticated={(session) => {
        signIn(session);
        navigate("dashboard");
      }}
    />
  );
}
