import test from "node:test";
import assert from "node:assert/strict";
import { toCSV } from "./csv.js";

test("CSV para o Excel: BOM, separador ponto e vírgula e aspas escapadas", () => {
  assert.equal(
    toCSV([
      ["Produto", "Saldo"],
      ['Pão "da casa"', 2.5],
    ]),
    '﻿"Produto";"Saldo"\r\n"Pão ""da casa""";"2.5"',
  );
});

test("texto que o Excel leria como fórmula ganha um apóstrofo; números não", () => {
  assert.equal(
    toCSV([["=HYPERLINK(1)", "+1", "-2 kg", "@x", "ok", -3]]),
    "﻿\"'=HYPERLINK(1)\";\"'+1\";\"'-2 kg\";\"'@x\";\"ok\";\"-3\"",
  );
});
