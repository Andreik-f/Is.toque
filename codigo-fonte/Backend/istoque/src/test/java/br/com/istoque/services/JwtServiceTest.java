package br.com.istoque.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes unitários do JwtService (HT001): a chave precisa ter pelo menos 256
 * bits, o expiraEm devolvido é o mesmo "exp" do token e o token vencido ou
 * de outra chave é recusado. Não sobe o Spring.
 */
class JwtServiceTest {

    private static final String CHAVE = Base64.getEncoder().encodeToString(
            "chave-de-teste-com-mais-de-trinta-e-dois-bytes".getBytes(StandardCharsets.UTF_8));
    private static final long OITO_HORAS_EM_MS = 8L * 60 * 60 * 1000;

    /** Chave com menos de 32 bytes é recusada na subida da aplicação, e não no primeiro login. */
    @Test
    void criar_comChaveCurta_lancaIllegalState() {
        String chaveCurta = Base64.getEncoder().encodeToString("curta".getBytes(StandardCharsets.UTF_8));

        assertThrows(IllegalStateException.class, () -> new JwtService(chaveCurta, OITO_HORAS_EM_MS));
    }

    /** Em produção, a chave padrão de desenvolvimento (a que está no repositório) é recusada. */
    @Test
    void criar_emProducaoComAChavePadraoDeDesenvolvimento_lancaIllegalState() {
        IllegalStateException erro = assertThrows(IllegalStateException.class,
                () -> new JwtService(CHAVE, OITO_HORAS_EM_MS, CHAVE, true));

        assertTrue(erro.getMessage().contains("JWT_SECRET"));
    }

    /** Em produção com uma chave própria (JWT_SECRET definida), a API sobe normalmente. */
    @Test
    void criar_emProducaoComChavePropria_sobeNormalmente() {
        String chavePadraoDev = Base64.getEncoder().encodeToString(
                "chave-padrao-de-desenvolvimento-do-repositorio".getBytes(StandardCharsets.UTF_8));

        assertDoesNotThrow(() -> new JwtService(CHAVE, OITO_HORAS_EM_MS, chavePadraoDev, true));
    }

    /** Em desenvolvimento (fora do Render), a chave padrão continua valendo. */
    @Test
    void criar_foraDeProducaoComAChavePadrao_sobeNormalmente() {
        assertDoesNotThrow(() -> new JwtService(CHAVE, OITO_HORAS_EM_MS, CHAVE, false));
    }

    /**
     * A ligação com o Spring funciona: com RENDER=true (como no Render) e sem
     * JWT_SECRET, o contexto não sobe; com uma chave própria, sobe.
     */
    @Test
    void contexto_comRenderTrue_recusaAChavePadraoEAceitaAChavePropria() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withUserConfiguration(JwtService.class)
                .withPropertyValues("jwt.expiration-ms=" + OITO_HORAS_EM_MS,
                        "jwt.secret-padrao-dev=" + CHAVE, "RENDER=true");

        runner.withPropertyValues("jwt.secret=" + CHAVE)
                .run(contexto -> assertTrue(contexto.getStartupFailure() != null));

        String chavePropria = Base64.getEncoder().encodeToString(
                "chave-propria-da-producao-com-mais-de-32-bytes".getBytes(StandardCharsets.UTF_8));
        runner.withPropertyValues("jwt.secret=" + chavePropria)
                .run(contexto -> assertTrue(contexto.getStartupFailure() == null));
    }

    /** Chave que nem é Base64 também falha com a mensagem que aponta para JWT_SECRET. */
    @Test
    void criar_comChaveQueNaoEBase64_lancaIllegalStateComMensagemClara() {
        IllegalStateException erro = assertThrows(IllegalStateException.class,
                () -> new JwtService("isto não é base64 !!", OITO_HORAS_EM_MS));

        assertTrue(erro.getMessage().contains("JWT_SECRET"));
    }

    /** O expiraEm sai no fuso de Brasília, e não no fuso do servidor onde a API roda. */
    @Test
    void gerarToken_devolveExpiraEmNoFusoDeBrasilia() {
        JwtService service = new JwtService(CHAVE, OITO_HORAS_EM_MS);

        JwtService.TokenGerado gerado = service.gerarToken("a@teste.com", 1, 1, "Administrador");

        assertEquals(ZoneOffset.ofHours(-3), gerado.expiraEm().getOffset());
    }

    /** O token guarda usuário, empresa e perfil, e o expiraEm é o mesmo "exp" de dentro dele. */
    @Test
    void gerarToken_guardaOsDadosEDevolveOMesmoInstanteDeExpiracao() {
        JwtService service = new JwtService(CHAVE, OITO_HORAS_EM_MS);

        JwtService.TokenGerado gerado = service.gerarToken("a@teste.com", 7, 3, "Administrador");
        Claims claims = service.validarToken(gerado.token());

        assertEquals("a@teste.com", claims.getSubject());
        assertEquals(7, claims.get("usuarioId", Integer.class));
        assertEquals(3, claims.get("empresaId", Integer.class));
        assertEquals("Administrador", claims.get("perfil", String.class));
        assertEquals(claims.getExpiration().toInstant(), gerado.expiraEm().toInstant());
        assertEquals(OITO_HORAS_EM_MS / 1000,
                claims.getExpiration().toInstant().getEpochSecond()
                        - claims.getIssuedAt().toInstant().getEpochSecond());
    }

    /** Token vencido lança ExpiredJwtException ao ser validado. */
    @Test
    void validarToken_comTokenExpirado_lancaExpiredJwtException() {
        JwtService service = new JwtService(CHAVE, -1_000);
        String vencido = service.gerarToken("a@teste.com", 1, 1, "Administrador").token();

        assertThrows(ExpiredJwtException.class, () -> service.validarToken(vencido));
    }

    /** Token gerado com outra chave não passa na validação. */
    @Test
    void validarToken_comTokenDeOutraChave_lancaJwtException() {
        String outraChave = Base64.getEncoder().encodeToString(
                "outra-chave-de-teste-com-mais-de-32-bytes!!".getBytes(StandardCharsets.UTF_8));
        String token = new JwtService(outraChave, OITO_HORAS_EM_MS)
                .gerarToken("a@teste.com", 1, 1, "Administrador").token();

        assertThrows(JwtException.class, () -> new JwtService(CHAVE, OITO_HORAS_EM_MS).validarToken(token));
    }
}
