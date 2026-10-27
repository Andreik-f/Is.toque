package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.services.PerfilService;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
@WithUsuarioAutenticado
class PerfilControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfilService perfilService;

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

        mockMvc.perform(get("/api/perfis").param("empresaId", empresaA.toString())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].nome").value("Administrador"))
                .andExpect(jsonPath("$[1].nome").value("Gerente"))
                .andExpect(jsonPath("$[2].nome").value("Funcionário"));
    }

    @Test
    void listarPerfis_comEmpresaIdDeOutraEmpresa_ignoraEUsaADoToken() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer empresaB = criarEmpresa("22333444000155");

        mockMvc.perform(get("/api/perfis").param("empresaId", empresaB.toString())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].id", containsInAnyOrder(idsDosPerfis(empresaA))));
    }

    @Test
    void listarPerfis_semEmpresaId_devolveOsPerfisDaEmpresaDoToken() throws Exception {
        criarEmpresa("11444777000161");
        Integer empresaB = criarEmpresa("22333444000155");

        mockMvc.perform(get("/api/perfis")
                        .with(UsuarioDeTeste.autenticadoComo(empresaB, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[*].id", containsInAnyOrder(idsDosPerfis(empresaB))));
    }

    @Test
    void listarPerfis_semToken_devolve401() throws Exception {
        mockMvc.perform(get("/api/perfis").with(anonymous()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(RestAuthenticationEntryPoint.MENSAGEM));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void listarPerfis_semSerAdministrador_devolve200(String perfil) throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(get("/api/perfis").with(UsuarioDeTeste.autenticadoComo(empresaA, perfil)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    /** Cadastra uma empresa (que já cria os perfis padrão) e devolve o id dela. */
    private Integer criarEmpresa(String cnpj) {
        Empresa empresa = new Empresa();
        empresa.setRazaoSocial("Empresa " + cnpj + " LTDA");
        empresa.setCnpj(cnpj);
        empresa = empresaRepository.save(empresa);
        perfilService.criarPerfisPadrao(empresa);
        return empresa.getId();
    }

    private Integer[] idsDosPerfis(Integer empresaId) {
        return perfilRepository.findByEmpresaIdOrderById(empresaId).stream()
                .map(Perfil::getId)
                .toArray(Integer[]::new);
    }
}
