package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.UnidadeMedida;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração da listagem de unidades de medida
 * (GET /api/unidades-medida).
 *
 * Cobre o HT023 (#48): o front precisa listar as unidades para montar o campo
 * de unidade do formulário de produto.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UnidadeMedidaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UnidadeMedidaRepository unidadeMedidaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    /** Antes de cada teste, limpa o banco e grava três unidades. */
    @BeforeEach
    void setUp() {
        limparBanco();
        salvarUnidade("un", "Unidade");
        salvarUnidade("kg", "Quilograma");
        salvarUnidade("L", "Litro");
    }

    @AfterEach
    void tearDown() {
        limparBanco();
    }

    /** Devolve todas as unidades, em ordem alfabética pelo nome, com id, sigla e nome. */
    @Test
    void listarUnidades_devolveTodasEmOrdemAlfabetica() throws Exception {
        mockMvc.perform(get("/api/unidades-medida"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nome").value("Litro"))
                .andExpect(jsonPath("$[0].sigla").value("L"))
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[1].nome").value("Quilograma"))
                .andExpect(jsonPath("$[2].nome").value("Unidade"));
    }

    private void salvarUnidade(String sigla, String nome) {
        UnidadeMedida unidade = new UnidadeMedida();
        unidade.setSigla(sigla);
        unidade.setNome(nome);
        unidadeMedidaRepository.save(unidade);
    }

    /** O produto aponta para a unidade, então sai primeiro. */
    private void limparBanco() {
        produtoRepository.deleteAll();
        unidadeMedidaRepository.deleteAll();
    }
}
