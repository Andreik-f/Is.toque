package br.com.istoque.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ItemReceitaRequestDTO(
        @NotNull(message = "O ID do produto é obrigatório")
        Integer produtoId,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        @Digits(integer = 9, fraction = 3, message = "A quantidade deve ter no máximo 9 dígitos inteiros e 3 decimais")
        BigDecimal quantidade
) {}