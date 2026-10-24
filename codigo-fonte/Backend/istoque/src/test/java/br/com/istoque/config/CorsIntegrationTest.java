package br.com.istoque.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsStringIgnoringCase;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes do CORS da API (HT027): o navegador só deixa o front chamar a API
 * se ela responder com a origem do front em Access-Control-Allow-Origin.
 *
 * As origens aceitas nos testes vêm de src/test/resources/application.properties
 * (só http://localhost:5173).
 */
@SpringBootTest
@AutoConfigureMockMvc
class CorsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    /** A consulta prévia (preflight) do front configurado é aceita. */
    @Test
    void preflight_deOrigemConfigurada_devolveOrigemPermitida() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "POST")
                        .header("Access-Control-Request-Headers", "content-type"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    /**
     * O front envia o token no cabeçalho Authorization (HT001): o preflight que
     * pede esse cabeçalho, vindo da origem configurada, tem de ser aceito.
     */
    @Test
    void preflight_comCabecalhoAuthorization_devolveOCabecalhoPermitido() throws Exception {
        mockMvc.perform(options("/api/produtos")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET")
                        .header("Access-Control-Request-Headers", "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Headers", containsStringIgnoringCase("authorization")));
    }

    /** Uma origem fora da lista é recusada, sem o cabeçalho de permissão. */
    @Test
    void preflight_deOutraOrigem_devolve403() throws Exception {
        mockMvc.perform(options("/api/auth/login")
                        .header("Origin", "https://outro-site.exemplo")
                        .header("Access-Control-Request-Method", "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
    }
}
