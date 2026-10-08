package br.com.istoque.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Pattern;

/**
 * Dados recebidos para criar ou atualizar o cadastro de uma empresa.
 */
public record EmpresaRequestDTO(

        @NotBlank(message = "A razão social é obrigatória")
        String razaoSocial,

        String nomeFantasia,

        @NotBlank(message = "O CNPJ é obrigatório")
        @Pattern(regexp = "[A-Za-z0-9]{12}\\d{2}|[A-Za-z0-9]{2}\\.[A-Za-z0-9]{3}\\.[A-Za-z0-9]{3}/[A-Za-z0-9]{4}-\\d{2}",
        message = "O CNPJ deve ter 14 caracteres, com ou sem máscara")
        String cnpj,

        @Email(message = "O e-mail informado é inválido")
        String email,

        String telefone,

        @PositiveOrZero(message = "Os dias de alerta de validade não podem ser negativos")
        Integer diasAlertaValidade

) {
}
