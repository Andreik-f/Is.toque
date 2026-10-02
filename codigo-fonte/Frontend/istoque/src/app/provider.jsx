import React from "react";
import { SessionProvider } from "@/stores/session-store.jsx";
import { UiStoreProvider } from "@/stores/ui-store.jsx";
import { CompanyDataProvider } from "./company-data.jsx";

// Providers globais que envolvem toda a aplicação.
export function AppProvider({ children }) {
  return (
    <UiStoreProvider>
      <SessionProvider>
        <CompanyDataProvider>{children}</CompanyDataProvider>
      </SessionProvider>
    </UiStoreProvider>
  );
}
