package br.com.istoque.exception;

import java.sql.SQLException;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Testes unitários do registro de erros no GlobalExceptionHandler (HT015).
 *
 * Erros inesperados (500) e violações de integridade (409) precisam aparecer
 * no log, senão não dá para descobrir a causa de uma falha em produção. A
 * resposta enviada ao cliente continua sem detalhes internos. O
 * OutputCaptureExtension captura o que é escrito no console durante o teste.
 */
@ExtendWith(OutputCaptureExtension.class)
class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    /** Um 500 grava a exceção completa no log, mas o cliente só recebe a mensagem genérica. */
    @Test
    void erroInesperado_registraAExcecaoNoLogSemExporAoCliente(CapturedOutput output) {
        ResponseEntity<ApiErrorResponse> resposta =
                handler.tratarErroGenerico(new IllegalStateException("detalhe interno da falha"));

        assertEquals(500, resposta.getStatusCode().value());
        assertTrue(output.getOut().contains("Erro inesperado ao processar a requisição"));
        assertTrue(output.getOut().contains("IllegalStateException: detalhe interno da falha"));
        assertFalse(resposta.getBody().message().contains("detalhe interno"));
    }

    /** Um 409 de integridade grava no log qual restrição do banco falhou. */
    @Test
    void violacaoDeIntegridade_registraARestricaoNoLog(CapturedOutput output) {
        ConstraintViolationException causa = new ConstraintViolationException(
                "duplicate key value violates unique constraint \"usuarios_email_key\"",
                new SQLException("duplicate key value violates unique constraint \"usuarios_email_key\""),
                "usuarios_email_key");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("falha ao gravar", causa);

        ResponseEntity<ApiErrorResponse> resposta = handler.tratarIntegridade(ex);

        assertEquals(409, resposta.getStatusCode().value());
        assertTrue(output.getOut().contains("usuarios_email_key"));
        assertFalse(resposta.getBody().message().contains("usuarios_email_key"));
    }

    @Test
    void violacaoDeIntegridade_naoExpoeDadosSensiveisNoLog(CapturedOutput output) {
        String mensagemDriver = "Key (email)=(pessoa@exemplo.com) already exists";
        ConstraintViolationException causa = new ConstraintViolationException(
                mensagemDriver,
                new SQLException(mensagemDriver),
                "usuarios_email_key");
        DataIntegrityViolationException ex = new DataIntegrityViolationException("falha ao gravar", causa);

        ResponseEntity<ApiErrorResponse> resposta = handler.tratarIntegridade(ex);

        assertEquals(409, resposta.getStatusCode().value());
        assertTrue(output.getOut().contains("usuarios_email_key"));
        assertFalse(output.getOut().contains("pessoa@exemplo.com"));
        assertFalse(output.getOut().contains("exemplo.com"));
    }

    @Test
    void violacaoDeIntegridade_semConstraintViolationException_registraRestricaoDesconhecida(CapturedOutput output) {
        DataIntegrityViolationException ex = new DataIntegrityViolationException("falha ao gravar",
                new RuntimeException("falha generica de integridade"));

        ResponseEntity<ApiErrorResponse> resposta = handler.tratarIntegridade(ex);

        assertEquals(409, resposta.getStatusCode().value());
        assertTrue(output.getOut().contains("desconhecida"));
    }
}
