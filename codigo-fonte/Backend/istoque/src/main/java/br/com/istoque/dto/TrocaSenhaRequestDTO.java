package br.com.istoque.dto;

import jakarta.validation.constraints.NotBlank;

public record TrocaSenhaRequestDTO(
    @NotBlank(message = "A nova senha não pode estar vazia")
    String novaSenha
) {}
