package br.com.istoque.security;

import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class AcessoNegadoIntegrationTest {

    private static final String CORPO = "{\"nome\":\"Novo\",\"descricao\":\"d\",\"permissoes\":[]}";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rotaProtegida_comFuncionario_devolve403NoFormatoPadraoENao500() throws Exception {
        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON).content(CORPO)
                        .with(UsuarioDeTeste.autenticadoComo(1, "Funcionário")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Seu perfil não permite esta ação."))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    @Test
    @WithUsuarioAutenticado(perfil = "Funcionário")
    void rotaProtegida_comFuncionarioPelaAnotacao_devolve403() throws Exception {
        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON).content(CORPO))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));
    }
}
