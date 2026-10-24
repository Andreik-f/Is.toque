package br.com.istoque.security;

/** Dados do usuário logado, disponíveis durante a requisição. Nunca contém a senha. */
public record UsuarioAutenticado(
        Integer id,
        String email,
        Integer empresaId,
        String perfil
) {
}
