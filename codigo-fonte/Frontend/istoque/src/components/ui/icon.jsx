import React from "react";

const paths = {
  home: "m3 10 9-7 9 7v10H3Z M9 20v-7h6v7",
  box: "m3 7 9-4 9 4v10l-9 4-9-4Z M3 7l9 4 9-4 M12 11v10",
  arrows: "M3 7h16m-5-5 5 5-5 5 M21 17H5m5-5-5 5 5 5",
  recipe: "M5 4h13v17H5z M8 8h7 M8 12h7 M8 16h4 M3 6h4 M3 11h4 M3 16h4",
  chart: "M4 3v17h17 M8 16v-5 M13 16V6 M18 16v-8",
  users:
    "M15 20v-2a5 5 0 0 0-10 0v2 M10 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8 M17 4a4 4 0 0 1 0 7 M19 14a5 5 0 0 1 3 4v2",
  search: "M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 M15 15l6 6",
  plus: "M12 5v14 M5 12h14",
  bell: "M6 8a6 6 0 0 1 12 0v6l2 3H4l2-3Z M10 21h4",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  chevron: "m9 5 7 7-7 7",
  down: "m6 9 6 6 6-6",
  check: "m5 12 4 4L19 6",
  close: "m6 6 12 12 M6 18 18 6",
  alert: "m12 3 10 18H2Z M12 9v5 M12 17v1",
  upload: "M12 16V3m-5 5 5-5 5 5 M4 15v6h16v-6",
  logout: "M9 3H3v18h6 M8 12h13m-5-5 5 5-5 5",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l3 2",
  filter: "M4 5h16l-6 7v7l-4 2v-9Z",
  download: "M12 3v13m-5-5 5 5 5-5 M4 17v4h16v-4",
  shield: "m12 2 8 3v7c0 5-8 10-8 10S4 17 4 12V5Z m-4 10 3 3 5-6",
  mail: "M3 5h18v14H3Z m0 0 9 7 9-7",
  edit: "m4 16 12-12 4 4L8 20H4Z",
  menu: "M4 6h16 M4 12h16 M4 18h16",
};

export function Icon({ name, size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.box} />
    </svg>
  );
}
