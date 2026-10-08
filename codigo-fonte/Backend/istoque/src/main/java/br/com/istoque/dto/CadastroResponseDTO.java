package br.com.istoque.dto;

/**
 * Resultado do cadastro: a empresa criada e o usuário administrador dela.
 */
public record CadastroResponseDTO(
        EmpresaResponseDTO empresa,
        UsuarioResponseDTO usuario
) {
}
