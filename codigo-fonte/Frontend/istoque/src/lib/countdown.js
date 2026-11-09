// Contagem regressiva em segundos. O que falta sai do horário final e do
// relógio, não de tiques somados: aba em segundo plano atrasa os timers, e a
// contagem não pode atrasar junto. O timer só roda enquanto há quem escute.
export function createCountdown(now = Date.now) {
  let end = 0;
  let timer = null;
  const listeners = new Set();
  const remaining = () => Math.max(0, Math.ceil((end - now()) / 1000));
  const notify = () => listeners.forEach((listener) => listener());

  function stop() {
    clearInterval(timer);
    timer = null;
  }

  function arm() {
    if (timer || !listeners.size || remaining() === 0) return;
    let last = remaining();
    timer = setInterval(() => {
      const current = remaining();
      if (current !== last) notify();
      last = current;
      if (current === 0) stop();
    }, 250);
  }

  return {
    getRemaining: remaining,
    start(seconds) {
      end = now() + seconds * 1000;
      stop();
      notify();
      arm();
    },
    subscribe(listener) {
      listeners.add(listener);
      arm();
      return () => {
        listeners.delete(listener);
        if (!listeners.size) stop();
      };
    },
  };
}
