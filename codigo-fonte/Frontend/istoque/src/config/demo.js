// Data de referência da demonstração: validade e relatórios usam este "hoje".
// Com login, as telas usam a data real.
export const DEMO_TODAY = new Date("2026-09-26T12:00:00-03:00");

// Como a data de referência aparece nos textos da demonstração.
export const DEMO_TODAY_LABEL = "26 set. 2026";

// Empresa e usuário mostrados sem login. O usuário é o de id 1 dos dados de
// exemplo (testing/mocks/seed-data.js).
export const DEMO_PROFILE = {
  company: "Cozinha da Casa",
  userId: 1,
  userName: "David Rocha",
  role: "Administrador",
};

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
