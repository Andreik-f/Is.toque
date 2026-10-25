package br.com.istoque.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TrocarSenhaPropriaRequestDTO(
        @NotBlank(message = "A senha atual não pode estar vazia")
        String senhaAtual,

        @NotBlank(message = "A nova senha não pode estar vazia")
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
        String novaSenha
) {}