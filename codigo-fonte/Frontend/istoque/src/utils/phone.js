// Telefone da empresa. O servidor valida de verdade (libphonenumber) e grava em
// E.164; aqui é só conforto para a pessoa: máscara ao digitar e aviso antes de
// enviar.
const digitos = (valor) => String(valor ?? "").replace(/\D/g, "");
const internacional = (valor) =>
  String(valor ?? "")
    .trim()
    .startsWith("+");

// Máscara brasileira enquanto digita: (31) 98888-7777. Com "+" no começo o
// número é internacional e fica livre, só com os dígitos.
export function mascararTelefone(valor) {
  if (internacional(valor)) return "+" + digitos(valor).slice(0, 15);
  const d = digitos(valor);
  if (d.length > 11) return d;
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  const corte = d.length === 11 ? 7 : 6;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}

// Brasil: DDD com 2 dígitos (sem zero à frente), 8 ou 9 dígitos, e o 9 na
// frente quando são 9. Internacional: "+" e de 8 a 15 dígitos.
export function telefoneValido(valor) {
  const d = digitos(valor);
  if (internacional(valor)) return d.length >= 8 && d.length <= 15;
  if (d.length !== 10 && d.length !== 11) return false;
  if (d[0] === "0") return false;
  return d.length === 10 || d[2] === "9";
}

// E.164 que o servidor devolve → o que aparece no campo.
export function telefoneParaExibir(e164) {
  if (!e164) return "";
  const brasileiro = /^\+55(\d{10,11})$/.exec(e164);
  return brasileiro ? mascararTelefone(brasileiro[1]) : e164;
}

function normalizar(valor) {
  const d = digitos(valor);
  if (!d) return "";
  if (internacional(valor)) return "+" + d;
  return d.length === 10 || d.length === 11 ? "+55" + d : d;
}

// O mesmo número em outro formato não é troca de telefone (o servidor também
// compara em E.164 e mantém a confirmação).
export const mesmoTelefone = (a, b) => normalizar(a) === normalizar(b);
