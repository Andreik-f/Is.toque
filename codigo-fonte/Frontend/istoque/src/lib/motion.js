// O reduzir movimento do CSS não para element.animate(), e o animationend não
// dispara quando a animação vira "animation: none". Quem espera esse evento
// para agir (como o fechamento do modal) precisa consultar isto antes, senão
// fica esperando um evento que nunca chega.
export function prefersReducedMotion() {
  return (
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Toca uma animação de element.animate() e devolve uma promessa para quem
// precisa esperar o fim (o mascote celebrando antes de entrar no sistema).
// Com reduzir movimento não anima e resolve na hora. A promessa nunca rejeita
// (cancelar a animação também resolve) e tem um prazo de segurança: com a aba
// em segundo plano o navegador pausa as animações e o "finished" pode não
// chegar, e a tela ficaria esperando.
export function playAnimation(element, keyframes, options = {}) {
  if (!element || prefersReducedMotion()) return Promise.resolve();
  const animation = element.animate(keyframes, options);
  const prazo = (options.delay ?? 0) + (options.duration ?? 0) + 150;
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, prazo);
    const acabou = () => {
      clearTimeout(timer);
      resolve();
    };
    animation.finished.then(acabou, acabou);
  });
}
