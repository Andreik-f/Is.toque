package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.UnidadeMedida;

/**
 * Dados devolvidos pela API ao listar as unidades de medida.
 */
public record UnidadeMedidaResponseDTO(
        Integer id,
        String sigla,
        String nome,
        Boolean fracionavel
) {

    public static UnidadeMedidaResponseDTO fromEntity(UnidadeMedida unidade) {
        return new UnidadeMedidaResponseDTO(unidade.getId(), unidade.getSigla(), unidade.getNome(),
                unidade.getFracionavel());
    }
}
