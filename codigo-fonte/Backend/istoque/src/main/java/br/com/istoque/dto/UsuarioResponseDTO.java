package br.com.istoque.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import br.com.istoque.infrastructure.entity.Usuario;
import java.time.OffsetDateTime;

public record UsuarioResponseDTO(
        Integer id,
        String nome,
        String email,
        Integer perfilId,
        String perfil,
        Integer empresaId,
        Boolean ativo,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime criadoEm,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime atualizadoEm
) {

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getId(),
                usuario.getPerfil().getNome(),
                usuario.getEmpresa().getId(),
                usuario.getAtivo(),
                usuario.getCriadoEm(),
                usuario.getAtualizadoEm()
        );
    }
}
