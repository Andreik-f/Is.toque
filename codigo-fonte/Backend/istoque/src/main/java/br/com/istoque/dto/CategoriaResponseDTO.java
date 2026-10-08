package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.Categoria;

/**
 * Dados devolvidos pela API ao consultar uma categoria de produtos.
 */
public record CategoriaResponseDTO(
        Integer id,
        String nome,
        String descricao
) {

    public static CategoriaResponseDTO fromEntity(Categoria categoria) {
        return new CategoriaResponseDTO(categoria.getId(), categoria.getNome(), categoria.getDescricao());
    }
}
