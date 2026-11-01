package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Permissao;

import java.util.List;

/**
 * Dados devolvidos pela API ao listar os perfis de uma empresa.
 */
public record PerfilResponseDTO(
        Integer id,
        String nome,
        String descricao,
        List<String> permissoes
) {

    public static PerfilResponseDTO fromEntity(Perfil perfil) {
        return new PerfilResponseDTO(perfil.getId(), perfil.getNome(), perfil.getDescricao(),
                perfil.getPermissoes().stream().map(Permissao::getCodigo).sorted().toList());
    }
}
