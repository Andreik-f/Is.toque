package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Usuario;
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
import org.springframework.test.web.servlet.ResultActions;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do cadastro pela tela (POST /api/auth/cadastro).
 *
 * Cobre o HT022 (#47): a empresa e o usuário administrador são criados juntos,
 * numa transação só. Se uma parte falhar, nada é gravado.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
class CadastroIntegrationTest {

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
     * Caminho feliz: devolve 201 com a empresa (CNPJ já com máscara) e o
     * administrador, com o perfil Administrador da própria empresa. Depois,
     * o administrador consegue entrar com o e-mail e a senha do cadastro.
     */
    @Test
    void cadastro_comDadosValidos_criaEmpresaEAdministrador() throws Exception {
        cadastrar("11444777000161", "dono@restaurante.com")
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.empresa.razaoSocial").value("Restaurante Exemplo LTDA"))
                .andExpect(jsonPath("$.empresa.cnpj").value("11.444.777/0001-61"))
                .andExpect(jsonPath("$.usuario.email").value("dono@restaurante.com"))
                .andExpect(jsonPath("$.usuario.perfil").value("Administrador"))
                .andExpect(jsonPath("$.usuario.senha").doesNotExist());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"dono@restaurante.com","senha":"SenhaValida123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nomeEmpresa").value("Restaurante Exemplo LTDA"));
    }

    @Test
    void cadastro_semToken_criaAdministradorComPerfilDaEmpresaNova() throws Exception {
        cadastrar("22333444000155", "outro@restaurante.com").andExpect(status().isCreated());

        String resposta = cadastrar("11444777000161", "dono@restaurante.com")
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/empresas/minha"))
                .andReturn().getResponse().getContentAsString();
        Integer empresaId = JsonPath.read(resposta, "$.empresa.id");

        Usuario administrador = usuarioRepository.findByEmail("dono@restaurante.com").orElseThrow();
        assertEquals(empresaId, administrador.getEmpresa().getId());
        assertEquals(empresaId, administrador.getPerfil().getEmpresa().getId());
        assertEquals("Administrador", administrador.getPerfil().getNome());
        assertEquals(empresaId, JsonPath.read(resposta, "$.usuario.empresaId"));
    }

    /**
     * O cadastro não pede os dias de alerta de validade: a empresa nasce com 3,
     * o mesmo padrão que o banco usa (DEFAULT 3 na migração V4).
     */
    @Test
    void cadastro_semDiasAlertaValidade_usaOPadraoDe3() throws Exception {
        cadastrar("11444777000161", "dono@restaurante.com")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.empresa.diasAlertaValidade").value(3));
    }

    /** CNPJ já cadastrado devolve 409, e nenhum usuário é criado. */
    @Test
    void cadastro_comCnpjJaCadastrado_devolve409() throws Exception {
        cadastrar("11444777000161", "primeiro@restaurante.com").andExpect(status().isCreated());

        cadastrar("11.444.777/0001-61", "segundo@restaurante.com")
                .andExpect(status().isConflict());

        assertFalse(usuarioRepository.findByEmail("segundo@restaurante.com").isPresent());
    }

    /**
     * E-mail já cadastrado devolve 409 e a empresa nova também não fica
     * gravada: empresa e administrador são criados na mesma transação.
     */
    @Test
    void cadastro_comEmailJaCadastrado_devolve409ENaoCriaAEmpresa() throws Exception {
        cadastrar("11444777000161", "dono@restaurante.com").andExpect(status().isCreated());

        cadastrar("22333444000155", "dono@restaurante.com")
                .andExpect(status().isConflict());

        assertEquals(1, empresaRepository.count());
        assertFalse(empresaRepository.existsByCnpj("22.333.444/0001-55"));
    }

    /** Corpo vazio devolve 400 com uma mensagem para cada campo obrigatório. */
    @Test
    void cadastro_comCamposFaltando_devolve400() throws Exception {
        mockMvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.razaoSocial").exists())
                .andExpect(jsonPath("$.campos.cnpj").exists())
                .andExpect(jsonPath("$.campos.nome").exists())
                .andExpect(jsonPath("$.campos.email").exists())
                .andExpect(jsonPath("$.campos.senha").exists());
    }

    /** Chama POST /api/auth/cadastro com o CNPJ e o e-mail informados. */
    private ResultActions cadastrar(String cnpj, String email) throws Exception {
        return mockMvc.perform(post("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"razaoSocial":"Restaurante Exemplo LTDA","cnpj":"%s","nome":"Dono do Restaurante","email":"%s","senha":"SenhaValida123"}
                        """.formatted(cnpj, email)));
    }
}
