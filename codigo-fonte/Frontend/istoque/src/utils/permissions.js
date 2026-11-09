// A sessão do login traz as permissões do perfil; sessão sem elas (demonstração
// ou cadastro recém-feito) não tem nenhuma.
export const temPermissao = (session, codigo) =>
  Boolean(session?.permissoes?.includes(codigo));
