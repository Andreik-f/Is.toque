export const fmt = (n) =>
  new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(n);

export const round = (n) => Math.round(n * 1000) / 1000 || 0;

export const formatDate = (s) =>
  new Date(s.length === 10 ? s + "T12:00:00" : s).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
  });
