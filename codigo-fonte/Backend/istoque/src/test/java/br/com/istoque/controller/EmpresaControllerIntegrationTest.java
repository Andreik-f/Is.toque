package br.com.istoque.controller;

import br.com.istoque.security.RestAccessDeniedHandler;
import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;

/**
 * Testes de integração do cadastro de empresas (/api/empresas).
 *
 * Cobrem os perfis padrão: toda empresa nova já nasce com eles.
 *
 * Cobre também o HT035 (#63): os dias de alerta de validade são obrigatórios no
 * banco (V4). Sem o campo, a empresa nasce com o padrão 3, e um PUT sem o campo
 * mantém o valor que ela já tinha em vez de ser recusado pelo NOT NULL.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class EmpresaControllerIntegrationTest {

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
     * Uma empresa nova já precisa sair do cadastro com os perfis padrão. Sem
     * eles não dá para cadastrar o primeiro usuário da empresa, porque todo
     * usuário precisa de um perfil dela.
     */
    @Test
    void criarEmpresa_jaCriaOsPerfisPadrao() throws Exception {
        Integer empresaId = criarEmpresa();

        for (String nome : List.of("Administrador", "Gerente", "Funcionário")) {
            assertTrue(perfilRepository.findByNomeAndEmpresaId(nome, empresaId).isPresent(),
                    "A empresa nova deveria ter o perfil " + nome);
        }
    }

    /**
     * Os dias de alerta de validade são obrigatórios no banco (padrão 3). O cadastro
     * não informa o campo, e a empresa nova precisa sair com o padrão em vez de ser
     * recusada pelo banco.
     */
    @Test
    void criarEmpresa_semDiasDeAlerta_usaOPadraoDe3() throws Exception {
        Integer empresaId = criarEmpresa();

        assertEquals(3, empresaRepository.findById(empresaId).orElseThrow().getDiasAlertaValidade());
    }

    @Test
    void criarEmpresa_comDiasDeAlerta_gravaOValorInformado() throws Exception {
        Integer empresaId = criarEmpresa();

        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"Empresa Nova LTDA","cnpj":"11444777000161","diasAlertaValidade":10}
                """)
                .andExpect(status().isOk());

        assertEquals(10, empresaRepository.findById(empresaId).orElseThrow().getDiasAlertaValidade());
    }

    /**
     * Atualizar sem informar os dias de alerta não pode apagar o valor que a empresa já
     * tinha (a coluna é obrigatória); informando, o valor novo vale.
     */
    @Test
    void atualizarEmpresa_semDiasDeAlerta_mantemOValorAtual() throws Exception {
        Integer empresaId = criarEmpresa();
        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"Empresa Nova LTDA","cnpj":"11444777000161","diasAlertaValidade":10}
                """)
                .andExpect(status().isOk());

        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"Empresa Renomeada LTDA","cnpj":"11444777000161"}
                """)
                .andExpect(status().isOk());

        assertEquals(10, empresaRepository.findById(empresaId).orElseThrow().getDiasAlertaValidade());

        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"Empresa Renomeada LTDA","cnpj":"11444777000161","diasAlertaValidade":5}
                """)
                .andExpect(status().isOk());

        assertEquals(5, empresaRepository.findById(empresaId).orElseThrow().getDiasAlertaValidade());
    }

    @Test
    void buscarMinhaEmpresa_devolveAEmpresaDoToken() throws Exception {
        Integer empresaA = criarEmpresa();
        Integer empresaB = criarEmpresa("22333444000155", "dono@empresab.com");

        mockMvc.perform(get("/api/empresas/minha")
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(empresaA))
                .andExpect(jsonPath("$.cnpj").value("11.444.777/0001-61"));

        mockMvc.perform(get("/api/empresas/minha")
                        .with(UsuarioDeTeste.autenticadoComo(empresaB, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(empresaB));
    }

    @Test
    void atualizarMinhaEmpresa_alteraSoAEmpresaDoToken() throws Exception {
        Integer empresaA = criarEmpresa();
        Integer empresaB = criarEmpresa("22333444000155", "dono@empresab.com");

        atualizarMinhaEmpresa(empresaA, """
                {"razaoSocial":"Empresa A Renomeada LTDA","cnpj":"11444777000161"}
                """)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(empresaA))
                .andExpect(jsonPath("$.razaoSocial").value("Empresa A Renomeada LTDA"));

        assertEquals("Empresa Nova LTDA", empresaRepository.findById(empresaB).orElseThrow().getRazaoSocial());
    }

    @Test
    void atualizarMinhaEmpresa_comCnpjDeOutraEmpresa_devolve409() throws Exception {
        Integer empresaA = criarEmpresa();
        criarEmpresa("22333444000155", "dono@empresab.com");

        atualizarMinhaEmpresa(empresaA, """
                {"razaoSocial":"Empresa Nova LTDA","cnpj":"22333444000155"}
                """)
                .andExpect(status().isConflict());

        assertEquals("11.444.777/0001-61", empresaRepository.findById(empresaA).orElseThrow().getCnpj());
    }

    @Test
    void atualizarMinhaEmpresa_comRazaoSocialAcimaDe255Caracteres_devolve400ENaoAltera() throws Exception {
        Integer empresaId = criarEmpresa();
        String razaoSocial256 = "A".repeat(256);

        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"%s","cnpj":"11444777000161"}
                """.formatted(razaoSocial256))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.razaoSocial").value("A razão social deve ter no máximo 255 caracteres"));

        assertEquals("Empresa Nova LTDA", empresaRepository.findById(empresaId).orElseThrow().getRazaoSocial());
    }

    @Test
    void atualizarMinhaEmpresa_comRazaoSocialNoLimiteDe255Caracteres_devolve200() throws Exception {
        Integer empresaId = criarEmpresa();
        String razaoSocial255 = "A".repeat(255);

        atualizarMinhaEmpresa(empresaId, """
                {"razaoSocial":"%s","cnpj":"11444777000161"}
                """.formatted(razaoSocial255))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.razaoSocial").value(razaoSocial255));

        assertEquals(razaoSocial255, empresaRepository.findById(empresaId).orElseThrow().getRazaoSocial());
    }

    @Test
    void rotasGlobaisDeEmpresa_naoExistemMais() throws Exception {
        Integer empresaA = criarEmpresa();
        Integer empresaB = criarEmpresa("22333444000155", "dono@empresab.com");
        RequestPostProcessor comoEmpresaA = UsuarioDeTeste.autenticadoComo(empresaA, "Administrador");

        mockMvc.perform(get("/api/empresas").with(comoEmpresaA))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/empresas/{id}", empresaB).with(comoEmpresaA))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/empresas").with(comoEmpresaA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"razaoSocial":"Empresa C LTDA","cnpj":"33444555000166"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/empresas/{id}", empresaB).with(comoEmpresaA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"razaoSocial":"Invadida LTDA","cnpj":"22333444000155"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/empresas/{id}", empresaB).with(comoEmpresaA))
                .andExpect(status().isNotFound());

        assertEquals(2, empresaRepository.count());
        assertEquals("Empresa Nova LTDA", empresaRepository.findById(empresaB).orElseThrow().getRazaoSocial());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void atualizarMinhaEmpresa_semSerAdministrador_devolve403ENaoAltera(String perfil) throws Exception {
        Integer empresaId = criarEmpresa();

        mockMvc.perform(put("/api/empresas/minha")
                        .with(UsuarioDeTeste.autenticadoComo(empresaId, perfil))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"razaoSocial":"Empresa Renomeada LTDA","cnpj":"11444777000161"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertEquals("Empresa Nova LTDA", empresaRepository.findById(empresaId).orElseThrow().getRazaoSocial());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void buscarMinhaEmpresa_semSerAdministrador_devolve200(String perfil) throws Exception {
        Integer empresaId = criarEmpresa();

        mockMvc.perform(get("/api/empresas/minha").with(UsuarioDeTeste.autenticadoComo(empresaId, perfil)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(empresaId));
    }

    @ParameterizedTest
    @CsvSource({"GET, /api/empresas/minha", "PUT, /api/empresas/minha"})
    void minhaEmpresa_semToken_devolve401(String metodo, String rota) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), rota)
                        .with(anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(RestAuthenticationEntryPoint.MENSAGEM));
    }

    private Integer criarEmpresa() throws Exception {
        return criarEmpresa("11444777000161", "dono@empresanova.com");
    }

    private Integer criarEmpresa(String cnpj, String email) throws Exception {
        String resposta = mockMvc.perform(post("/api/auth/cadastro")
                        .with(anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"razaoSocial":"Empresa Nova LTDA","cnpj":"%s","nome":"Dono","email":"%s","senha":"SenhaValida123"}
                                """.formatted(cnpj, email)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.empresa.id");
    }

    private ResultActions atualizarMinhaEmpresa(Integer empresaId, String json) throws Exception {
        return mockMvc.perform(put("/api/empresas/minha")
                .with(UsuarioDeTeste.autenticadoComo(empresaId, "Administrador"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }
}
