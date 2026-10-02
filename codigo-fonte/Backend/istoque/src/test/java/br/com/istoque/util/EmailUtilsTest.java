package br.com.istoque.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes unitários do EmailUtils.normalizar.
 *
 * O e-mail precisa ficar sempre no mesmo formato, porque o banco compara o
 * texto exato: é disso que dependem a checagem de e-mail duplicado e o login.
 */
class EmailUtilsTest {

    /** Letras maiúsculas viram minúsculas: "Ana@Loja.com" é a mesma conta de "ana@loja.com". */
    @Test
    void emailComMaiusculas_ficaEmMinusculas() {
        assertEquals("ana@loja.com", EmailUtils.normalizar("Ana@Loja.COM"));
    }

    /** Espaços nas pontas, comuns ao copiar e colar, são removidos. */
    @Test
    void emailComEspacosNasPontas_ficaSemEspacos() {
        assertEquals("ana@loja.com", EmailUtils.normalizar("  ana@loja.com "));
    }

    /** null volta null, sem lançar NullPointerException. */
    @Test
    void emailNulo_devolveNulo() {
        assertNull(EmailUtils.normalizar(null));
    }
}
