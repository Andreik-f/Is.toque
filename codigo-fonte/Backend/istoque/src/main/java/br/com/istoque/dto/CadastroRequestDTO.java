package br.com.istoque.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Dados da tela de cadastro: a empresa e o usuário administrador dela,
 * criados juntos numa requisição só.
 */
public record CadastroRequestDTO(

        @NotBlank(message = "A razão social é obrigatória")
        @Size(max = 150, message = "A razão social deve ter no máximo 150 caracteres")
        String razaoSocial,

        @NotBlank(message = "O CNPJ é obrigatório")
        @Pattern(regexp = "[A-Za-z0-9]{12}\\d{2}|[A-Za-z0-9]{2}\\.[A-Za-z0-9]{3}\\.[A-Za-z0-9]{3}/[A-Za-z0-9]{4}-\\d{2}",
        message = "O CNPJ deve ter 14 caracteres, com ou sem máscara")
        String cnpj,

        @NotBlank(message = "O nome é obrigatório")
        @Size(max = 120, message = "O nome deve ter no máximo 120 caracteres")
        String nome,

        @NotBlank(message = "O e-mail é obrigatório")
        @Email(message = "O e-mail informado é inválido")
        @Size(max = 150, message = "O e-mail deve ter no máximo 150 caracteres")
        String email,

        @NotBlank(message = "A senha é obrigatória")
        @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
        String senha

) {
}
