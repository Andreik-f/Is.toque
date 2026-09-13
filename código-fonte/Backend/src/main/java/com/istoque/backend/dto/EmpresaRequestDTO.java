package com.istoque.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Dados recebidos para criar ou atualizar o cadastro de uma empresa.
 */
public record EmpresaRequestDTO(

        @NotBlank(message = "A razão social é obrigatória")
        String razaoSocial,

        String nomeFantasia,

        @NotBlank(message = "O CNPJ é obrigatório")
        String cnpj,

        @Email(message = "O e-mail informado é inválido")
        String email,

        String telefone,

        @PositiveOrZero(message = "Os dias de alerta de validade não podem ser negativos")
        Integer diasAlertaValidade

) {
}
