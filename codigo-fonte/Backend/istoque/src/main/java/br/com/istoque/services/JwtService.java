package br.com.istoque.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Service
public class JwtService {

    /** Token assinado e o momento exato em que ele expira (o mesmo que vai dentro dele). */
    public record TokenGerado(String token, OffsetDateTime expiraEm) {}

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs) {

        byte[] keyBytes = Decoders.BASE64.decode(secret);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET deve ser um valor em Base64 com pelo menos 32 bytes (256 bits)");
        }
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationMs;
    }

    public TokenGerado gerarToken(String email, Integer usuarioId,
                                  Integer empresaId, String perfil) {

        // o JWT guarda datas em segundos; truncar aqui faz o expiraEm da resposta
        // ser idêntico ao "exp" do token
        Instant agora = Instant.now().truncatedTo(ChronoUnit.SECONDS);
        Instant expiracao = agora.plusMillis(expirationMs);

        String token = Jwts.builder()
                .subject(email)
                .claim("usuarioId", usuarioId)
                .claim("empresaId", empresaId)
                .claim("perfil", perfil)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiracao))
                .signWith(secretKey)
                .compact();

        return new TokenGerado(token,
                OffsetDateTime.ofInstant(expiracao, ZoneId.systemDefault()));
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