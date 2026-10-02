// CSV no formato que o Excel em português abre direto: separador ";" e BOM
// (﻿) no início, para os acentos aparecerem certos. Texto que começa com
// =, +, -, @, tabulação ou quebra de linha ganha um apóstrofo na frente, para
// o Excel não executá-lo como fórmula.
export function toCSV(rows) {
  const cell = (value) => {
    let text = String(value);
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(text))
      text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  };
  return "﻿" + rows.map((row) => row.map(cell).join(";")).join("\r\n");
}

export function downloadCSV(name, rows) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
