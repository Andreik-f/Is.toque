package br.com.istoque.dto;

import br.com.istoque.infrastructure.entity.TipoProduto;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

/**
 * Dados recebidos para cadastrar ou atualizar um produto.
 */
public record ProdutoRequestDTO(

        Integer categoriaId,

        @NotNull(message = "A unidade de medida é obrigatória")
        Integer unidadeMedidaId,

        @Size(max = 50, message = "O código deve ter no máximo 50 caracteres")
        String codigo,

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String nome,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
        String descricao,

        @NotNull(message = "O tipo é obrigatório")
        TipoProduto tipo,

        @PositiveOrZero(message = "A quantidade atual não pode ser negativa")
        @Digits(integer = 9, fraction = 3, message = "A quantidade atual deve ter no máximo 9 dígitos inteiros e 3 decimais")
        BigDecimal quantidadeAtual,

        @PositiveOrZero(message = "O estoque mínimo não pode ser negativo")
        @Digits(integer = 9, fraction = 3, message = "O estoque mínimo deve ter no máximo 9 dígitos inteiros e 3 decimais")
        BigDecimal estoqueMinimo,

        @PositiveOrZero(message = "O estoque máximo não pode ser negativo")
        @Digits(integer = 9, fraction = 3, message = "O estoque máximo deve ter no máximo 9 dígitos inteiros e 3 decimais")
        BigDecimal estoqueMaximo,

        Boolean controlaValidade

) {

    @AssertTrue(message = "O estoque máximo não pode ser menor que o estoque mínimo")
    public boolean isEstoqueMaximoValido() {
        if (estoqueMaximo == null || estoqueMinimo == null) {
            return true;
        }
        return estoqueMaximo.compareTo(estoqueMinimo) >= 0;
    }
}
