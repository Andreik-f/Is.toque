import { useState, useSyncExternalStore } from "react";
import { createCountdown } from "@/lib/countdown.js";

// Segundos que faltam para a contagem acabar. iniciar(segundos) recomeça.
export function useCountdown() {
  const [countdown] = useState(createCountdown);
  const restante = useSyncExternalStore(
    countdown.subscribe,
    countdown.getRemaining,
    countdown.getRemaining,
  );
  return { restante, iniciar: countdown.start };
}
