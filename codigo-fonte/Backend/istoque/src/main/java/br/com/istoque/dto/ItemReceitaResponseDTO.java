package br.com.istoque.dto;

import java.math.BigDecimal;

public record ItemReceitaResponseDTO(
        Integer produtoId,
        String produtoNome,
        BigDecimal quantidade
) {}
