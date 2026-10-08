package br.com.istoque.dto;

import jakarta.validation.constraints.*;

/**
 * Dados recebidos para editar um usuário. Não tem senha: ela só é trocada
 * pelo PATCH /api/usuarios/{id}/senha.
 */
public record UsuarioUpdateDTO(

    @NotBlank(message = "O nome é obrigatório")
    String nome,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "O e-mail informado é inválido")
    String email,

    @NotNull(message = "O perfil é obrigatório")
    Integer perfilId,

    @NotNull(message = "A empresa é obrigatória")
    Integer empresaId

) {}
