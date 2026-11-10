package br.com.istoque.security;

import br.com.istoque.support.UsuarioDeTeste;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class PermissoesPorRotaIntegrationTest {

    private static final Set<String> SEM_REGRA_DE_PERMISSAO = Set.of(
            "/api/auth/login", "/api/auth/cadastro", "/api/usuarios/me/senha",
            "/api/auth/recuperar-senha", "/api/auth/recuperar-senha/confirmar");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    private RequestMappingHandlerMapping handlerMapping;

    private static RequestPostProcessor semPermissao() {
        return UsuarioDeTeste.autenticadoComPermissoes(1, "Sem permissões", List.of());
    }

    @ParameterizedTest(name = "{0} {1}")
    @CsvSource({
            "POST,/api/produtos",
            "POST,/api/produtos/",
            "PUT,/api/produtos/1",
            "PATCH,/api/produtos/1/desativar",
            "PATCH,/api/produtos/1/reativar",
            "POST,/api/categorias",
            "POST,/api/perfis",
            "PUT,/api/perfis/1",
            "DELETE,/api/perfis/1",
            "GET,/api/usuarios",
            "POST,/api/usuarios",
            "PUT,/api/usuarios/1",
            "PATCH,/api/usuarios/1/senha",
            "DELETE,/api/usuarios/1",
            "PUT,/api/empresas/minha",
            "POST,/api/receitas",
            "PUT,/api/receitas/1",
            "PATCH,/api/receitas/1/desativar",
            "POST,/api/movimentacoes",
            "POST,/api/movimentacoes/ajustes",
            "POST,/api/producoes",
            "GET,/api/relatorios/estoque"
    })
    void usuarioSemPermissao_devolve403ComAMensagemPadrao(String metodo, String caminho) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), caminho).with(semPermissao()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("Seu perfil não permite esta ação."));
    }

    @ParameterizedTest(name = "GET {0}")
    @CsvSource({"/api/produtos", "/api/receitas", "/api/categorias", "/api/perfis", "/api/permissoes",
            "/api/empresas/minha", "/api/unidades-medida"})
    void consultasDeUsuarioSemPermissao_naoDao403(String caminho) throws Exception {
        int status = mockMvc.perform(get(caminho).with(semPermissao())).andReturn().getResponse().getStatus();

        assertNotEquals(403, status);
    }

    @Test
    void trocarAPropriaSenha_semPermissao_naoDa403() throws Exception {
        int status = mockMvc.perform(patch("/api/usuarios/me/senha").with(semPermissao()))
                .andReturn().getResponse().getStatus();

        assertNotEquals(403, status);
    }

    @Test
    void funcionario_recebe403EmAjustesMasNaoEmMovimentacoes() throws Exception {
        mockMvc.perform(post("/api/movimentacoes/ajustes").with(UsuarioDeTeste.autenticadoComo(1, "Funcionário")))
                .andExpect(status().isForbidden());

        int status = mockMvc.perform(post("/api/movimentacoes").with(UsuarioDeTeste.autenticadoComo(1, "Funcionário")))
                .andReturn().getResponse().getStatus();
        assertNotEquals(403, status);
    }

    @Test
    void todaRotaQueAlteraDados_exigeAlgumaPermissao() throws Exception {
        List<String> semProtecao = new ArrayList<>();
        for (RequestMappingInfo info : handlerMapping.getHandlerMethods().keySet()) {
            for (RequestMethod metodo : info.getMethodsCondition().getMethods()) {
                if (metodo == RequestMethod.GET) {
                    continue;
                }
                for (String padrao : info.getPathPatternsCondition().getPatternValues()) {
                    String caminho = padrao.replaceAll("\\{[^}]+}", "1");
                    if (SEM_REGRA_DE_PERMISSAO.contains(caminho)) {
                        continue;
                    }
                    int status = mockMvc.perform(request(HttpMethod.valueOf(metodo.name()), caminho)
                                    .with(semPermissao()))
                            .andReturn().getResponse().getStatus();
                    if (status != 403) {
                        semProtecao.add(metodo + " " + padrao + " -> " + status);
                    }
                }
            }
        }

        assertEquals(List.of(), semProtecao, "rotas sem regra de permissão no SecurityConfig");
    }
}
