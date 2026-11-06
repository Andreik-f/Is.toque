package br.com.istoque.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Gera e valida o token de acesso (JWT assinado com HS256). A chave vem de
 * jwt.secret (variável JWT_SECRET, em Base64, com pelo menos 32 bytes) e o
 * token vale jwt.expiration-ms (8 horas). O token guarda o usuário, a empresa
 * e o perfil, nunca a senha.
 */
@Service
public class JwtService {

    /** Token assinado e o momento exato em que ele expira (o mesmo que vai dentro dele). */
    public record TokenGerado(String token, OffsetDateTime expiraEm) {}

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(String secret, long expirationMs) {
        this(secret, expirationMs, "", false);
    }

    @Autowired
    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs,
            @Value("${jwt.secret-padrao-dev:}") String secretPadraoDev,
            // o Render define RENDER=true em todo serviço; é como sabemos que é produção
            @Value("${RENDER:false}") boolean emProducao) {

        // a chave padrão está no repositório: em produção qualquer um forjaria tokens com ela
        if (emProducao && !secretPadraoDev.isBlank() && secretPadraoDev.equals(secret)) {
            throw new IllegalStateException(
                    "Em produção, defina a variável de ambiente JWT_SECRET: a chave padrão de desenvolvimento não pode ser usada");
        }

        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (RuntimeException ex) {
            throw new IllegalStateException(
                    "JWT_SECRET deve ser um valor em Base64 com pelo menos 32 bytes (256 bits)", ex);
        }
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET deve ser um valor em Base64 com pelo menos 32 bytes (256 bits)");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public TokenGerado gerarToken(String email, Integer usuarioId,
                                  Integer empresaId, String perfil) {
        return gerarToken(email, usuarioId, empresaId, perfil, 0);
    }

    public TokenGerado gerarToken(String email, Integer usuarioId,
                                  Integer empresaId, String perfil, int tokenVersao) {

        // o JWT guarda datas em segundos; truncar aqui faz o expiraEm da resposta
        // ser idêntico ao "exp" do token
        Instant agora = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiracao = agora.plusMillis(expirationMs);

        String token = Jwts.builder()
                .subject(email)
                .claim("usuarioId", usuarioId)
                .claim("empresaId", empresaId)
                .claim("perfil", perfil)
                .claim("tv", tokenVersao)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiracao))
                .signWith(secretKey)
                .compact();

        // fuso de Brasília, o mesmo das demais datas da API (spring.jackson.time-zone),
        // para o offset não depender do servidor
        return new TokenGerado(token,
                OffsetDateTime.ofInstant(expiracao, ZoneId.of("America/Sao_Paulo")));
    }

    /** Lança JwtException se a assinatura for inválida, o token estiver adulterado ou expirado. */
    public Claims validarToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
