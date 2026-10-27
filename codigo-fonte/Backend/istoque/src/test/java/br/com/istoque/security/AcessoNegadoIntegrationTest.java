package br.com.istoque.security;

import br.com.istoque.services.PerfilService;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class AcessoNegadoIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Autorizacao autorizacao;

    @MockitoBean
    private PerfilService perfilService;

    @BeforeEach
    void setUp() {
        given(perfilService.listarPorEmpresa(any())).willAnswer(invocacao -> {
            autorizacao.exigirAdministrador();
            return List.of();
        });
    }

    @Test
    void servicoQueExigeAdministrador_comGerente_devolve403NoFormatoPadraoENao500() throws Exception {
        mockMvc.perform(get("/api/perfis").param("empresaId", "1")
                        .with(UsuarioDeTeste.autenticadoComo(1, "Gerente")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithUsuarioAutenticado(perfil = "Funcionário")
    void servicoQueExigeAdministrador_comFuncionarioPelaAnotacao_devolve403() throws Exception {
        mockMvc.perform(get("/api/perfis").param("empresaId", "1"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));
    }

    @Test
    void servicoQueExigeAdministrador_comAdministrador_devolve200() throws Exception {
        mockMvc.perform(get("/api/perfis").param("empresaId", "1"))
                .andExpect(status().isOk());
    }
}
