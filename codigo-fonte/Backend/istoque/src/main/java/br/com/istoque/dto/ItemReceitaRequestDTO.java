package br.com.istoque.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ItemReceitaRequestDTO(
        @NotNull(message = "O ID do produto é obrigatório")
        Integer produtoId,

        @NotNull(message = "A quantidade é obrigatória")
        @Positive(message = "A quantidade deve ser maior que zero")
        BigDecimal quantidade
) {}