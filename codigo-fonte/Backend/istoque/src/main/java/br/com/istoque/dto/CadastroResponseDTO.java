package br.com.istoque.dto;

import java.time.OffsetDateTime;

/**
 * Resultado do cadastro: a empresa criada, o usuário administrador dela e o
 * token de acesso (o usuário já sai do cadastro logado).
 */
public record CadastroResponseDTO(
        EmpresaResponseDTO empresa,
        UsuarioResponseDTO usuario,
        String token,
        OffsetDateTime expiraEm
) {
}