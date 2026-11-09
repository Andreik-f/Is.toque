import { errorMessage } from "../../../lib/api-client.js";

export const CODIGO_INVALIDO = "Código inválido ou vencido.";
export const SEGUNDOS_ENTRE_CODIGOS = 60;

// O servidor só diz que o telefone foi confirmado pela data; ela vem sem fuso,
// então aqui só se olha se existe.
export const telefoneConfirmado = (empresa) =>
  Boolean(empresa?.telefoneVerificadoEm);

// O PUT substitui o registro: o que não for enviado é apagado. Por isso o corpo
// leva a empresa inteira, só com o telefone trocado.
export function companyToApi(empresa, telefone) {
  return {
    razaoSocial: empresa.razaoSocial,
    nomeFantasia: empresa.nomeFantasia ?? null,
    cnpj: empresa.cnpj,
    email: empresa.email ?? null,
    telefone: telefone?.trim() || null,
    diasAlertaValidade: empresa.diasAlertaValidade,
  };
}

// Código errado, vencido, já usado ou sem tentativas: o servidor responde igual
// e a tela também, sem dizer qual dos casos.
export const erroDoCodigo = (error) =>
  error?.status === 400 ? CODIGO_INVALIDO : errorMessage(error);

// 429 vale tanto para o intervalo de 60 s quanto para o limite por hora, e o
// servidor não diz quanto falta: a tela mostra a mensagem dele e não conta.
export const pedidoBloqueado = (error) => error?.status === 429;

export function createCompanyApi(api) {
  const getCompany = () => api.get("/empresas/minha");
  return {
    getCompany,
    sendPhoneCode: () => api.post("/empresas/minha/telefone/codigo"),
    confirmPhoneCode: (codigo) =>
      api.post("/empresas/minha/telefone/confirmar", { codigo }),
    // Lê a empresa logo antes de gravar, para não desfazer o que outra aba ou
    // outra tela tenha mudado nos demais campos.
    async saveCompanyPhone(telefone) {
      const atual = await getCompany();
      return api.put("/empresas/minha", companyToApi(atual, telefone));
    },
  };
}
