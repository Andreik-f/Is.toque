import { useEffect, useRef, useState } from "react";

// Quantas vezes o valor mudou desde que o componente montou (0 ao montar).
// Serve para animar só a mudança, nunca a primeira renderização: o elemento
// leva key={contagem} (remonta e reinicia a animação a cada mudança) e a
// classe do efeito só quando a contagem passa de zero. Tirar a classe num
// re-render qualquer cortaria a animação no meio; por isso a contagem não
// volta a zero. counts(antes, agora) decide o que vale como mudança (ex.: só
// quando o número sobe).
export function useChangeCount(
  value,
  counts = (before, now) => before !== now,
) {
  const [count, setCount] = useState(0);
  const last = useRef(value);
  useEffect(() => {
    if (counts(last.current, value)) setCount((n) => n + 1);
    last.current = value;
    // counts é uma regra fixa do chamador, não um dado que muda
  }, [value]);
  return count;
}
