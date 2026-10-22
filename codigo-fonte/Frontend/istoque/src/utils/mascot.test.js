import test from "node:test";
import assert from "node:assert/strict";
import { mascotFace } from "./mascot.js";

test("e-mail vazio leva o olho ao extremo esquerdo e olhando para baixo", () => {
  const face = mascotFace({ focus: "email", emailLength: 0 }, "duas");
  assert.equal(face.x, -34);
  assert.equal(face.y, 14);
  assert.equal(face.olho, "aberto");
});

test("com 11 caracteres o olho está no centro e com 22 ou mais no extremo direito", () => {
  assert.equal(mascotFace({ focus: "email", emailLength: 11 }, "duas").x, 0);
  assert.equal(mascotFace({ focus: "email", emailLength: 22 }, "duas").x, 34);
  // passou do limite: não anda mais
  assert.equal(mascotFace({ focus: "email", emailLength: 80 }, "duas").x, 34);
});

test("foco na senha ou na confirmação fecha o olho", () => {
  for (const focus of ["senha", "confirmacao"]) {
    const face = mascotFace({ focus, emailLength: 7 }, "duas");
    assert.equal(face.olho, "fechado");
    assert.equal(face.x, 0);
  }
});

test("senha visível vence o foco na senha e arregala o olho", () => {
  const face = mascotFace(
    { focus: "senha", emailLength: 7, passwordVisible: true },
    "duas",
  );
  assert.deepEqual(face, { x: 0, y: 0, olho: "arregalado" });
});

test("senha visível com o foco no e-mail: o olho segue o e-mail", () => {
  const face = mascotFace(
    { focus: "email", emailLength: 11, passwordVisible: true },
    "duas",
  );
  assert.deepEqual(face, { x: 0, y: 14, olho: "aberto" });
  assert.equal(
    mascotFace(
      { focus: "email", emailLength: 22, passwordVisible: true },
      "duas",
    ).x,
    34,
  );
});

test("senha visível sem foco arregala o olho", () => {
  const face = mascotFace({ focus: null, passwordVisible: true }, "duas");
  assert.equal(face.olho, "arregalado");
});

test("sem foco o olho fica no centro e aberto", () => {
  assert.deepEqual(mascotFace({ focus: null, emailLength: 15 }, "duas"), {
    x: 0,
    y: 0,
    olho: "aberto",
  });
  // campo que o mascote não acompanha (ex.: CNPJ) também não mexe o olho
  assert.deepEqual(mascotFace({ focus: "cnpj", emailLength: 15 }, "duas"), {
    x: 0,
    y: 0,
    olho: "aberto",
  });
});

test("a variante de uma caixa usa o limite de 30", () => {
  assert.equal(mascotFace({ focus: "email", emailLength: 0 }, "uma").x, -30);
  assert.equal(mascotFace({ focus: "email", emailLength: 22 }, "uma").x, 30);
});
