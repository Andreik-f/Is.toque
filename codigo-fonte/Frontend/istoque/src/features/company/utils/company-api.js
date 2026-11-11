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
