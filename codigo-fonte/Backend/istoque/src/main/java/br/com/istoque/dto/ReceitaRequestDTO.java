package br.com.istoque.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ReceitaRequestDTO(
        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String nome,

        String descricao,

        @NotBlank(message = "A categoria é obrigatória")
        @Size(max = 60, message = "A categoria deve ter no máximo 60 caracteres")
        String categoria,

        @NotBlank(message = "O rendimento é obrigatório")
        @Size(max = 60, message = "O rendimento deve ter no máximo 60 caracteres")
        String rendimento,

        @NotNull(message = "O tempo de preparo é obrigatório")
        @Positive(message = "O tempo de preparo deve ser maior que zero")
        Integer tempoPreparoMinutos,

        @NotEmpty(message = "A receita deve ter pelo menos um item")
        @Valid
        List<ItemReceitaRequestDTO> itens
) {}
