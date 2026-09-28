package br.com.istoque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Dados recebidos para cadastrar uma categoria de produtos.
 */
public record CategoriaRequestDTO(

        @NotNull(message = "A empresa é obrigatória")
        Integer empresaId,

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 80, message = "O nome deve ter no máximo 80 caracteres")
        String nome,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
        String descricao

) {
}
