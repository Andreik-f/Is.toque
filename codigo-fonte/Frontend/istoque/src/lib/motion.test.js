import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { playAnimation, prefersReducedMotion } from "./motion.js";

// O matchMedia só existe no navegador: cada teste monta o seu e o remove no
// fim, para não vazar para os outros.
async function withMatchMedia(matchMedia, run) {
  const original = globalThis.matchMedia;
  if (matchMedia) globalThis.matchMedia = matchMedia;
  else delete globalThis.matchMedia;
  try {
    await run();
  } finally {
    if (original) globalThis.matchMedia = original;
    else delete globalThis.matchMedia;
  }
}

// Elemento falso: só o que o playAnimation usa (animate e o finished).
function fakeElement(finished) {
  const calls = [];
  return {
    calls,
    animate(keyframes, options) {
      calls.push({ keyframes, options });
      return { finished };
    },
  };
}

test("fora do navegador (sem matchMedia) o movimento não é reduzido", async () => {
  await withMatchMedia(undefined, () =>
    assert.equal(prefersReducedMotion(), false),
  );
});

test("reduz o movimento quando o sistema pede e consulta a mídia certa", async () => {
  const asked = [];
  await withMatchMedia(
    (query) => {
      asked.push(query);
      return { matches: true };
    },
    () => assert.equal(prefersReducedMotion(), true),
  );
  assert.deepEqual(asked, ["(prefers-reduced-motion: reduce)"]);
});

test("não reduz o movimento quando o sistema não pede", async () => {
  await withMatchMedia(
    () => ({ matches: false }),
    () => assert.equal(prefersReducedMotion(), false),
  );
});

test("com reduzir movimento a animação é pulada e a promessa resolve na hora", async () => {
  const element = fakeElement(new Promise(() => {}));
  await withMatchMedia(
    () => ({ matches: true }),
    async () => {
      await playAnimation(element, [{ opacity: 0 }], { duration: 300 });
    },
  );
  assert.equal(element.calls.length, 0);
});

test("sem reduzir movimento toca a animação e resolve quando ela termina", async () => {
  const element = fakeElement(Promise.resolve());
  const keyframes = [{ opacity: 0 }, { opacity: 1 }];
  const options = { duration: 300, easing: "ease-out" };
  await playAnimation(element, keyframes, options);
  assert.deepEqual(element.calls, [{ keyframes, options }]);
});

test("se o finished nunca chegar, o prazo de segurança resolve a promessa", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  try {
    const element = fakeElement(new Promise(() => {}));
    const promessa = playAnimation(element, [], { duration: 300, delay: 50 });
    // duração + atraso + 150 ms de folga
    mock.timers.tick(499);
    let resolveu = false;
    promessa.then(() => (resolveu = true));
    await Promise.resolve();
    assert.equal(resolveu, false);
    mock.timers.tick(1);
    await promessa;
  } finally {
    mock.timers.reset();
  }
});

test("animação cancelada não rejeita a promessa", async () => {
  const element = fakeElement(Promise.reject(new Error("cancelada")));
  await playAnimation(element, [], { duration: 300 });
});

test("sem elemento a promessa resolve na hora", async () => {
  await playAnimation(null, [], { duration: 300 });
});
