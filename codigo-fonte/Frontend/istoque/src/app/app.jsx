import React from "react";
import { AppProvider } from "./provider.jsx";
import { AppRouter } from "./router.jsx";

export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
