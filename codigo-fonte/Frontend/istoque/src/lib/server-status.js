import { useEffect, useState } from "react";
import { API_URL } from "./api-client.js";

// Base da API sem o "/api". Em desenvolvimento a API é relativa (proxy do Vite,
// back local que não dorme): não há o que esperar e devolve null.
export const healthUrl = (apiUrl = API_URL) =>
  /^https?:\/\//.test(apiUrl)
    ? `${apiUrl.replace(/\/+$/, "").replace(/\/api$/, "")}/actuator/health`
    : null;

// No Render gratuito a API dorme: pergunta ao health a cada gapMs até vir 200.
export async function waitForServer(url, { signal, tries = 30, gapMs = 3000 } = {}) {
  for (let i = 0; i < tries && !signal?.aborted; i++) {
    if (await fetch(url, { signal }).then((r) => r.ok, () => false)) return true;
    await new Promise((resolve) => setTimeout(resolve, gapMs));
  }
  return false;
}

// true se a API ainda não respondeu depois de 2 s (hora do aviso "acordando").
export function useServerWakeup() {
  const [waking, setWaking] = useState(false);
  useEffect(() => {
    const url = healthUrl();
    if (!url) return undefined;
    const control = new AbortController();
    const timer = setTimeout(() => setWaking(true), 2000);
    waitForServer(url, { signal: control.signal }).then(() => {
      clearTimeout(timer);
      setWaking(false);
    });
    return () => {
      control.abort();
      clearTimeout(timer);
    };
  }, []);
  return waking;
}
