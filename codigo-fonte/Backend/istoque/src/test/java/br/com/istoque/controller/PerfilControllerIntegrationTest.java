package br.com.istoque.controller;

import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração da listagem de perfis (GET /api/perfis).
 *
 * Cobre o HT023 (#48): o front precisa listar os perfis da empresa para
 * montar o campo de perfil do formulário de usuário.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
class PerfilControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /** Antes de cada teste, limpa o banco na ordem das chaves estrangeiras. */
    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
    }

    /**
     * Devolve só os perfis da empresa pedida, na ordem em que foram criados
     * (Administrador, Gerente e Funcionário), sem os perfis da outra empresa.
     */
    @Test
    void listarPerfis_daEmpresa_devolveSoOsPerfisDelaNaOrdemDeCriacao() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        criarEmpresa("22333444000155");

        mockMvc.perform(get("/api/perfis").param("empresaId", empresaA.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nome").value("Administrador"))
                .andExpect(jsonPath("$[1].nome").value("Gerente"))
                .andExpect(jsonPath("$[2].nome").value("Funcionário"));
    }

    /** Empresa que não existe devolve 404, e não uma lista vazia. */
    @Test
    void listarPerfis_comEmpresaInexistente_devolve404() throws Exception {
        mockMvc.perform(get("/api/perfis").param("empresaId", "999999"))
                .andExpect(status().isNotFound());
    }

    /** Sem o parâmetro empresaId devolve 400 dizendo qual parâmetro falta, e não 500. */
    @Test
    void listarPerfis_semEmpresaId_devolve400() throws Exception {
        mockMvc.perform(get("/api/perfis"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("O parâmetro 'empresaId' é obrigatório"));
    }

    /** Cadastra uma empresa pela API (que já cria os perfis padrão) e devolve o id dela. */
    private Integer criarEmpresa(String cnpj) throws Exception {
        String resposta = mockMvc.perform(post("/api/empresas")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"razaoSocial":"Empresa %s LTDA","cnpj":"%s"}
                                """.formatted(cnpj, cnpj)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }
}
