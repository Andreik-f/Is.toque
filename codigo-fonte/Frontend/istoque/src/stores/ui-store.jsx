import React, { createContext, useContext, useEffect, useState } from "react";

// Estado global da interface: modal aberto e mensagem de confirmação (toast).
const UiStoreContext = createContext(null);

export function UiStoreProvider({ children }) {
  const [modal, setModal] = useState(null),
    [toast, setToast] = useState("");
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const value = {
    modal,
    openModal: setModal,
    closeModal: () => setModal(null),
    toast,
    notify: setToast,
    dismissToast: () => setToast(""),
  };
  return (
    <UiStoreContext.Provider value={value}>{children}</UiStoreContext.Provider>
  );
}

export function useUiStore() {
  return useContext(UiStoreContext);
}
