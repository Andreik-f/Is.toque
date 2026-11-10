package br.com.istoque.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RedefinirSenhaRequestDTO(
        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "O e-mail informado é inválido")
        String email,

        @NotBlank(message = "O código é obrigatório")
        @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos")
        String codigo,

        @NotBlank(message = "A nova senha não pode estar vazia")
        @Size(min = 8, message = "A nova senha deve ter no mínimo 8 caracteres")
        String novaSenha
) {
}
