package com.istoque.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.istoque.backend.model.Empresa;

import java.time.OffsetDateTime;

/**
 * Dados devolvidos pela API ao consultar uma empresa.
 */
public record EmpresaResponseDTO(

        Integer id,
        String razaoSocial,
        String nomeFantasia,
        String cnpj,
        String email,
        String telefone,
        Integer diasAlertaValidade,
        Boolean ativo,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime criadoEm,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime atualizadoEm

) {

    public static EmpresaResponseDTO fromEntity(Empresa empresa) {
        return new EmpresaResponseDTO(
                empresa.getId(),
                empresa.getRazaoSocial(),
                empresa.getNomeFantasia(),
                empresa.getCnpj(),
                empresa.getEmail(),
                empresa.getTelefone(),
                empresa.getDiasAlertaValidade(),
                empresa.getAtivo(),
                empresa.getCriadoEm(),
                empresa.getAtualizadoEm()
        );
    }

}
