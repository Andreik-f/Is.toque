import React from "react";
import { AuthScreen } from "@/features/auth/components/auth-screen.jsx";
import { navigate } from "@/hooks/use-hash-route.js";

// #login, #cadastro e #recuperar abrem fora do layout principal.
export function AuthRoute({ route }) {
  return <AuthScreen route={route} go={navigate} />;
}
