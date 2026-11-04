package br.com.istoque.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TelefoneUtilsTest {

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "(31) 98765-4321|+5531987654321",
            "31987654321|+5531987654321",
            "+55 31 98765-4321|+5531987654321",
            "5531987654321|+5531987654321",
            "+44 20 7183 8750|+442071838750"
    })
    void normalizar_gravaEmE164(String entrada, String esperado) {
        assertEquals(esperado, TelefoneUtils.normalizar(entrada));
    }

    @Test
    void normalizar_vazioViraNulo() {
        assertNull(TelefoneUtils.normalizar(null));
        assertNull(TelefoneUtils.normalizar("  "));
    }

    @ParameterizedTest
    @ValueSource(strings = {"123", "abc", "(31) 1234-5", "+55 31 0000-0000"})
    void invalido_naoValida(String entrada) {
        assertFalse(TelefoneUtils.valido(entrada));
        assertThrows(IllegalArgumentException.class, () -> TelefoneUtils.normalizar(entrada));
    }

    @Test
    void ehCelular_distingueCelularDeFixo() {
        assertTrue(TelefoneUtils.ehCelular("+5531987654321"));
        assertFalse(TelefoneUtils.ehCelular("+553133334444"));
    }

    @Test
    void mascarar_mostraSoOsQuatroUltimosDigitos() {
        assertEquals("***4321", TelefoneUtils.mascarar("+5531987654321"));
    }
}
