import React from "react";
import { DemoStoreProvider } from "@/stores/demo-store.jsx";
import { UiStoreProvider } from "@/stores/ui-store.jsx";

// Providers globais que envolvem toda a aplicação.
export function AppProvider({ children }) {
  return (
    <UiStoreProvider>
      <DemoStoreProvider>{children}</DemoStoreProvider>
    </UiStoreProvider>
  );
}
