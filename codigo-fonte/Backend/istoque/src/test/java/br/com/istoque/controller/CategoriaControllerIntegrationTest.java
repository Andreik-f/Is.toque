package br.com.istoque.controller;

import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import br.com.istoque.infrastructure.entity.Categoria;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.repository.CategoriaRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração das categorias de produtos (/api/categorias).
 *
 * Cobre o HT023 (#48): o front precisa listar e cadastrar as categorias da
 * empresa para montar o campo de categoria do formulário de produto.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class CategoriaControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    private Empresa empresaA;
    private Empresa empresaB;

    /** Antes de cada teste, limpa o banco e cria as empresas A e B. */
    @BeforeEach
    void setUp() {
        limparBanco();

        empresaA = new Empresa();
        empresaA.setRazaoSocial("Empresa A LTDA");
        empresaA.setCnpj("11111111000101");
        empresaA = empresaRepository.save(empresaA);

        empresaB = new Empresa();
        empresaB.setRazaoSocial("Empresa B LTDA");
        empresaB.setCnpj("22222222000102");
        empresaB = empresaRepository.save(empresaB);
    }

    // os outros testes apagam empresas; categoria não pode sobrar apontando para elas
    @AfterEach
    void tearDown() {
        limparBanco();
    }

    /** Categoria válida devolve 201 com Location e os dados gravados. */
    @Test
    void criarCategoria_comDadosValidos_devolve201ComLocation() throws Exception {
        criarCategoria(empresaA.getId(), "Laticínios")
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.nome").value("Laticínios"));
    }

    /**
     * A listagem devolve só as categorias da empresa pedida, em ordem
     * alfabética: cada empresa só enxerga as próprias categorias.
     */
    @Test
    void listarCategorias_daEmpresa_naoMostraAsDeOutraEmpresa() throws Exception {
        salvarCategoria("Laticínios", empresaA);
        salvarCategoria("Bebidas", empresaA);
        salvarCategoria("Hortifruti", empresaB);

        mockMvc.perform(get("/api/categorias").param("empresaId", empresaA.getId().toString())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("Bebidas"))
                .andExpect(jsonPath("$[1].nome").value("Laticínios"));

        mockMvc.perform(get("/api/categorias")
                        .with(UsuarioDeTeste.autenticadoComo(empresaB.getId(), "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nome").value("Hortifruti"));
    }

    /** Sem nome devolve 400 com a mensagem do campo. */
    @Test
    void criarCategoria_semNome_devolve400() throws Exception {
        mockMvc.perform(post("/api/categorias")
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), "Administrador"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"empresaId":%d}
                                """.formatted(empresaA.getId())))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("O nome é obrigatório"));
    }

    @Test
    void categorias_comEmpresaIdDeOutraEmpresa_ignoraEUsaADoToken() throws Exception {
        mockMvc.perform(post("/api/categorias")
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), "Administrador"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"empresaId":%d,"nome":"Bebidas"}
                                """.formatted(empresaB.getId())))
                .andExpect(status().isCreated());

        assertEquals(1, categoriaRepository.findByEmpresaIdOrderByNome(empresaA.getId()).size());
        assertTrue(categoriaRepository.findByEmpresaIdOrderByNome(empresaB.getId()).isEmpty());

        mockMvc.perform(get("/api/categorias").param("empresaId", empresaB.getId().toString())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nome").value("Bebidas"));
    }

    @ParameterizedTest
    @CsvSource({"GET, /api/categorias", "POST, /api/categorias"})
    void rotaDeCategorias_semToken_devolve401(String metodo, String rota) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), rota)
                        .with(anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(RestAuthenticationEntryPoint.MENSAGEM));
    }

    /** Chama POST /api/categorias com a empresa e o nome informados. */
    private ResultActions criarCategoria(Integer empresaId, String nome) throws Exception {
        return mockMvc.perform(post("/api/categorias")
                .with(UsuarioDeTeste.autenticadoComo(empresaId, "Administrador"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"%s"}
                        """.formatted(nome)));
    }

    /** Grava uma categoria direto pelo repositório, para montar o cenário. */
    private void salvarCategoria(String nome, Empresa empresa) {
        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setEmpresa(empresa);
        categoriaRepository.save(categoria);
    }

    /** Apaga tudo na ordem das chaves estrangeiras, com a empresa por último. */
    private void limparBanco() {
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
    }
}
