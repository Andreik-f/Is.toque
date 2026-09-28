export function downloadCSV(name, rows) {
  const blob = new Blob(
      [
        "﻿" +
          rows
            .map((row) =>
              row
                .map((v) => '"' + String(v).replaceAll('"', '""') + '"')
                .join(";"),
            )
            .join("\r\n"),
      ],
      { type: "text/csv;charset=utf-8" },
    ),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
