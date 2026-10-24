package br.com.istoque.controller;

import br.com.istoque.support.WithUsuarioAutenticado;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;

/**
 * Testes de integração do cadastro e da exclusão de empresas (/api/empresas).
 *
 * Cobrem os perfis padrão: toda empresa nova já nasce com eles, e eles saem
 * junto quando a empresa é excluída, sem apagar dados de quem já usa o sistema.
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
     * Uma empresa que só tem os perfis padrão pode ser excluída: os perfis
     * saem junto com ela, em vez de travar a exclusão.
     */
    @Test
    void deletarEmpresa_semOutrosDados_apagaAEmpresaEOsPerfis() throws Exception {
        Integer empresaId = criarEmpresa();

        mockMvc.perform(delete("/api/empresas/{id}", empresaId))
                .andExpect(status().isOk());

        assertFalse(empresaRepository.existsById(empresaId));
        assertTrue(perfilRepository.findByNomeAndEmpresaId("Administrador", empresaId).isEmpty());
    }

    /**
     * Com um usuário cadastrado, a exclusão devolve 409 e nada é apagado, nem
     * a empresa nem os perfis: excluir a empresa não pode levar junto os dados
     * de quem já usa o sistema. O usuário é criado pela API com o perfil
     * Administrador da empresa nova, como no primeiro cadastro de verdade.
     */
    @Test
    void deletarEmpresa_comUsuario_devolve409ENaoApagaNada() throws Exception {
        Integer empresaId = criarEmpresa();
        Integer perfilAdminId = perfilRepository.findByNomeAndEmpresaId("Administrador", empresaId)
                .orElseThrow()
                .getId();

        mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"nome":"Admin","email":"admin@empresanova.com","senha":"SenhaValida123","perfilId":%d,"empresaId":%d}
                        """.formatted(perfilAdminId, empresaId)))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/empresas/{id}", empresaId))
                .andExpect(status().isConflict());

        assertTrue(empresaRepository.existsById(empresaId));
        assertTrue(perfilRepository.findByNomeAndEmpresaId("Administrador", empresaId).isPresent());
    }

    /** Cadastra uma empresa pela API e devolve o id dela. */
    private Integer criarEmpresa() throws Exception {
        String resposta = mockMvc.perform(post("/api/empresas")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"razaoSocial":"Empresa Nova LTDA","cnpj":"11444777000161"}
                        """))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }
}
