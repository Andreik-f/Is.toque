package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.Permissao;

/**
 * Dados devolvidos pela API ao listar as permissões.
 */
public record PermissaoResponseDTO(
        String codigo,
        String descricao,
        String modulo
) {

    public static PermissaoResponseDTO fromEntity(Permissao permissao) {
        return new PermissaoResponseDTO(permissao.getCodigo(), permissao.getDescricao(), permissao.getModulo());
    }
}
