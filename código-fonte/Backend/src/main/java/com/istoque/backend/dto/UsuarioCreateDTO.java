package com.istoque.backend.dto;

public record UsuarioCreateDTO(
    String nome,
    String email,
    String senha,
    Integer perfilId,
    Integer empresaId
) {}