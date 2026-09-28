// Data de referência da demonstração: validade e relatórios usam este "hoje".
export const DEMO_TODAY = new Date("2026-09-26T12:00:00-03:00");

// "Agora" da demonstração: o dia de DEMO_TODAY com o horário real. As
// movimentações registradas na tela usam esta data, para caírem no mesmo
// "hoje" dos relatórios e dos dados de exemplo.
export function demoNow(agora = new Date()) {
  const data = new Date(DEMO_TODAY);
  data.setHours(
    agora.getHours(),
    agora.getMinutes(),
    agora.getSeconds(),
    agora.getMilliseconds(),
  );
  return data;
}
