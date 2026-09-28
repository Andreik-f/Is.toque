package br.com.istoque.dto;

public record LoginResponseDTO(
    Integer id,
    String nome,
    String email,
    String perfil,
    Integer empresaId,
    String nomeEmpresa
) {}
