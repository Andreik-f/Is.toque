package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.Perfil;

/**
 * Dados devolvidos pela API ao listar os perfis de uma empresa.
 */
public record PerfilResponseDTO(
        Integer id,
        String nome,
        String descricao
) {

    public static PerfilResponseDTO fromEntity(Perfil perfil) {
        return new PerfilResponseDTO(perfil.getId(), perfil.getNome(), perfil.getDescricao());
    }
}
