package br.com.istoque.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

/**
 * Testes unitários do CnpjUtils.formatar.
 *
 * O CNPJ precisa ficar sempre no mesmo formato (com máscara, ex.:
 * 12.345.678/0001-90), porque o banco compara o texto exato: é disso que
 * depende a checagem de CNPJ duplicado. Como o formatar não usa
 * Spring nem banco, este é um teste unitário puro e roda em milissegundos.
 */
class CnpjUtilsTest {

    /** Caso principal: os 14 caracteres sem máscara recebem a pontuação. */
    @Test
    void cnpjSemMascara_recebeMascara() {
        assertEquals("12.345.678/0001-90", CnpjUtils.formatar("12345678000190"));
    }

    /**
     * Formatar um CNPJ que já tem máscara não muda nada. É isso que permite
     * chamar o formatar mais de uma vez no mesmo valor (no service e no setter
     * da entidade) sem estragar o CNPJ.
     */
    @Test
    void cnpjComMascara_continuaIgual() {
        assertEquals("12.345.678/0001-90", CnpjUtils.formatar("12.345.678/0001-90"));
    }

    /**
     * CNPJ alfanumérico (novo formato da Receita Federal, a partir de
     * julho/2026) também recebe máscara. As letras viram maiúsculas para que
     * "ab" e "AB" não sejam gravados como CNPJs diferentes.
     */
    @Test
    void cnpjAlfanumericoMinusculo_recebeMascaraEmMaiusculas() {
        assertEquals("12.ABC.345/01DE-35", CnpjUtils.formatar("12abc34501de35"));
    }

    /**
     * Um valor que não tem 14 caracteres volta sem alteração. O formatar não
     * valida: quem recusa CNPJ inválido é o @Pattern do EmpresaRequestDTO.
     */
    @Test
    void cnpjComTamanhoInvalido_voltaSemAlteracao() {
        assertEquals("123", CnpjUtils.formatar("123"));
    }

    /** null volta null, sem lançar NullPointerException. */
    @Test
    void cnpjNulo_devolveNulo() {
        assertNull(CnpjUtils.formatar(null));
    }
}
