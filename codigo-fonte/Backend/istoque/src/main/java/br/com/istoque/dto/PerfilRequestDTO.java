package br.com.istoque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Set;

/**
 * Dados recebidos para criar ou alterar um perfil.
 */
public record PerfilRequestDTO(

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 255, message = "O nome deve ter no máximo 255 caracteres")
        String nome,

        @Size(max = 255, message = "A descrição deve ter no máximo 255 caracteres")
        String descricao,

        @NotNull(message = "As permissões são obrigatórias")
        @Size(max = 50, message = "A lista deve ter no máximo 50 permissões")
        Set<String> permissoes

) {
}
