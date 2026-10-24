package br.com.istoque.dto;
import java.time.OffsetDateTime;

public record LoginResponseDTO(
    Integer id,
    String nome,
    String email,
    String perfil,
    Integer empresaId,
    String nomeEmpresa,
    String token,
    OffsetDateTime expiraEm
) {}
