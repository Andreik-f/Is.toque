package br.com.istoque.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record ReceitaResponseDTO(
        Integer id,
        String nome,
        String descricao,
        String categoria,
        String rendimento,
        Integer tempoPreparoMinutos,
        Boolean ativo,
        OffsetDateTime criadoEm,
        OffsetDateTime atualizadoEm,
        List<ItemReceitaResponseDTO> itens
) {}