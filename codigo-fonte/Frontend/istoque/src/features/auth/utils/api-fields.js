// Conversão entre os campos das telas de acesso e os da API
// (POST /api/auth/login e POST /api/auth/cadastro).

// Nome do campo na API → nome do campo no formulário, quando são diferentes.
const FORM_NAMES = { razaoSocial: "razao_social" };

export function signupToApi(values) {
  return {
    razaoSocial: values.razao_social.trim(),
    cnpj: values.cnpj.trim(),
    nome: values.nome.trim(),
    email: values.email.trim(),
    senha: values.senha,
    ...(values.telefone?.trim() && { telefone: values.telefone.trim() }),
  };
}

// Erros por campo da API ("campos" do ApiErrorResponse) com os nomes do formulário.
export function formFieldErrors(apiFields) {
  return Object.fromEntries(
    Object.entries(apiFields ?? {}).map(([name, message]) => [
      FORM_NAMES[name] ?? name,
      message,
    ]),
  );
}

// O cadastro devolve a empresa e o administrador separados; a sessão usa o
// mesmo formato da resposta do login, com o nome da empresa calculado da
// mesma forma (nome fantasia ou, sem ele, a razão social).
export function sessionFromSignup({
  empresa,
  usuario,
  token,
  expiraEm,
  permissoes,
}) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil,
    empresaId: empresa.id,
    nomeEmpresa: empresa.nomeFantasia ?? empresa.razaoSocial,
    token,
    expiraEm,
    ...(permissoes && { permissoes }),
  };
}
