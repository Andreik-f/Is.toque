package br.com.istoque.dto;

import jakarta.validation.constraints.*;

public record UsuarioCreateDTO(

    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "O e-mail informado é inválido")
    String email,

    @NotBlank(message = "A senha é obrigatória")
    @Size(min = 8, message = "A senha deve ter no mínimo 8 caracteres")
    String senha,

    @NotNull(message = "O perfil é obrigatório")
    Integer perfilId,

    @NotNull(message = "A empresa é obrigatória")
    Integer empresaId

) {}
