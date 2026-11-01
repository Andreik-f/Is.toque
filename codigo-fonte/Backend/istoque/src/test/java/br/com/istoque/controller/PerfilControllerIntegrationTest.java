package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.security.Permissoes;
import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.services.PerfilService;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.PermissaoRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.emptyOrNullString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
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

    @Autowired
    private PermissaoRepository permissaoRepository;

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

    @Test
    void matrizPadrao_administradorTem9_gerenteTem6_funcionarioTem2() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(get("/api/perfis").with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].permissoes.length()").value(9))
                .andExpect(jsonPath("$[1].permissoes.length()").value(6))
                .andExpect(jsonPath("$[1].permissoes", hasItems("produtos.gerenciar", "estoque.movimentar",
                        "estoque.ajustar", "receitas.gerenciar", "producao.registrar", "relatorios.ver")))
                .andExpect(jsonPath("$[2].permissoes.length()").value(2))
                .andExpect(jsonPath("$[2].permissoes", contains("estoque.movimentar", "producao.registrar")));
    }

    @Test
    void listarPermissoes_devolveOsNoveCodigosComDescricaoEModulo() throws Exception {
        mockMvc.perform(get("/api/permissoes").with(UsuarioDeTeste.autenticadoComo(1, "Funcionário")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(9))
                .andExpect(jsonPath("$[?(@.codigo == 'estoque.ajustar')].modulo").value("Estoque"))
                .andExpect(jsonPath("$[*].descricao", everyItem(not(emptyOrNullString()))))
                .andExpect(jsonPath("$[*].modulo", everyItem(not(emptyOrNullString()))));
    }

    @Test
    void criarPerfil_comDadosValidos_devolve201ComLocation() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("  Estoquista  ", "Cuida do estoque", "estoque.movimentar", "estoque.ajustar"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.nome").value("Estoquista"))
                .andExpect(jsonPath("$.descricao").value("Cuida do estoque"))
                .andExpect(jsonPath("$.permissoes", contains("estoque.ajustar", "estoque.movimentar")));

        Perfil salvo = perfilRepository.findByNomeAndEmpresaId("Estoquista", empresaA).orElseThrow();
        assertEquals(2, salvo.getPermissoes().size());
    }

    @Test
    void atualizarPerfil_alteraNomeDescricaoEPermissoes() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gerente = idDoPerfil(empresaA, "Gerente");

        mockMvc.perform(put("/api/perfis/{id}", gerente).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Supervisor", "Nova descrição", "relatorios.ver"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Supervisor"))
                .andExpect(jsonPath("$.descricao").value("Nova descrição"))
                .andExpect(jsonPath("$.permissoes", contains("relatorios.ver")));

        Perfil salvo = perfilRepository.findById(gerente).orElseThrow();
        assertEquals("Supervisor", salvo.getNome());
        assertEquals(1, salvo.getPermissoes().size());
    }

    @Test
    void criarPerfil_comNomeRepetidoSemDiferenciarMaiusculas_devolve409() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("gerente", "d"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isConflict());
    }

    @Test
    void atualizarPerfil_comNomeDeOutroPerfilSemDiferenciarMaiusculas_devolve409() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(put("/api/perfis/{id}", idDoPerfil(empresaA, "Gerente"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("FUNCIONÁRIO", "d"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isConflict());
    }

    @Test
    void excluirPerfil_comUsuarios_devolve409() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gerente = idDoPerfil(empresaA, "Gerente");
        criarUsuario(empresaA, gerente, true);

        mockMvc.perform(delete("/api/perfis/{id}", gerente)
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isConflict());

        assertTrue(perfilRepository.existsById(gerente));
    }

    @Test
    void excluirPerfil_comUsuarioInativo_devolve409() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gerente = idDoPerfil(empresaA, "Gerente");
        criarUsuario(empresaA, gerente, false);

        mockMvc.perform(delete("/api/perfis/{id}", gerente)
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isConflict());
    }

    @Test
    void excluirPerfil_semUsuarios_devolve204() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gerente = idDoPerfil(empresaA, "Gerente");

        mockMvc.perform(delete("/api/perfis/{id}", gerente)
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isNoContent());

        assertFalse(perfilRepository.existsById(gerente));
    }

    @Test
    void atualizarEExcluirPerfil_deOutraEmpresa_devolve404() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer empresaB = criarEmpresa("22333444000155");
        Integer gerenteB = idDoPerfil(empresaB, "Gerente");

        mockMvc.perform(put("/api/perfis/{id}", gerenteB).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Invasor", "d"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isNotFound());
        mockMvc.perform(delete("/api/perfis/{id}", gerenteB)
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isNotFound());

        assertEquals("Gerente", perfilRepository.findById(gerenteB).orElseThrow().getNome());
    }

    @Test
    void atualizarAdministrador_semUsuariosGerenciar_devolve422() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(put("/api/perfis/{id}", idDoPerfil(empresaA, "Administrador"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Administrador", "d", "perfis.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void atualizarAdministrador_semPerfisGerenciar_devolve422() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(put("/api/perfis/{id}", idDoPerfil(empresaA, "Administrador"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Administrador", "d", "usuarios.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isUnprocessableContent());
    }

    @Test
    void atualizarAdministrador_renomeando_devolve422() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer administrador = idDoPerfil(empresaA, "Administrador");

        mockMvc.perform(put("/api/perfis/{id}", administrador)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Dono", "d", "usuarios.gerenciar", "perfis.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isUnprocessableContent());

        assertEquals("Administrador", perfilRepository.findById(administrador).orElseThrow().getNome());
    }

    @Test
    void atualizarAdministrador_mantendoAsDuasPermissoesObrigatorias_devolve200() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(put("/api/perfis/{id}", idDoPerfil(empresaA, "Administrador"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Administrador", "d", "usuarios.gerenciar", "perfis.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isOk());
    }

    @Test
    void criarPerfil_comCodigoDePermissaoInexistente_devolve400() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Novo", "d", "nao.existe"))
                        .with(UsuarioDeTeste.autenticadoComo(empresaA, "Administrador")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.permissoes").exists());
    }

    @Test
    void criarPerfil_semPermissoesNoCorpo_devolve400() throws Exception {
        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Novo\"}")
                        .with(UsuarioDeTeste.autenticadoComo(1, "Administrador")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.permissoes").exists());
    }

    @Test
    void criarPerfil_concedendoPermissaoQueQuemCriaNaoTem_devolve403() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");

        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Espertinho", "d", "usuarios.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComPermissoes(empresaA, "Gestor",
                                List.of(Permissoes.PERFIS_GERENCIAR))))
                .andExpect(status().isForbidden());

        assertFalse(perfilRepository.findByNomeAndEmpresaId("Espertinho", empresaA).isPresent());
    }

    @Test
    void atualizarProprioPerfil_incluindoPermissaoQueNaoTem_devolve403() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gestor = perfilRepository.save(new Perfil("Gestor", "d", empresaRepository.getReferenceById(empresaA)))
                .getId();

        mockMvc.perform(put("/api/perfis/{id}", gestor).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Gestor", "d", "perfis.gerenciar", "usuarios.gerenciar"))
                        .with(UsuarioDeTeste.autenticadoComPermissoes(empresaA, "Gestor",
                                List.of(Permissoes.PERFIS_GERENCIAR))))
                .andExpect(status().isForbidden());

        assertEquals(0, perfilRepository.findById(gestor).orElseThrow().getPermissoes().size());
    }

    @Test
    void atualizarPerfilComMaisPermissoesQueQuemEdita_devolve403ENaoAltera() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer gerente = idDoPerfil(empresaA, "Gerente");

        mockMvc.perform(put("/api/perfis/{id}", gerente).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Gerente", "d"))
                        .with(soPerfisGerenciar(empresaA)))
                .andExpect(status().isForbidden());

        Perfil salvo = perfilRepository.findById(gerente).orElseThrow();
        assertEquals("Gerente", salvo.getNome());
        assertEquals(6, salvo.getPermissoes().size());
    }

    @Test
    void excluirPerfilSemUsuariosComMaisPermissoesQueQuemExclui_devolve403ENaoExclui() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer perfil = perfilComPermissoes(empresaA, "Catalogo", Permissoes.PRODUTOS_GERENCIAR);

        mockMvc.perform(delete("/api/perfis/{id}", perfil).with(soPerfisGerenciar(empresaA)))
                .andExpect(status().isForbidden());

        assertTrue(perfilRepository.existsById(perfil));
    }

    @Test
    void atualizarPerfilQueSoTemPerfisGerenciar_porQuemTemSoPerfisGerenciar_devolve200() throws Exception {
        Integer empresaA = criarEmpresa("11444777000161");
        Integer perfil = perfilComPermissoes(empresaA, "Gestor de perfis", Permissoes.PERFIS_GERENCIAR);

        mockMvc.perform(put("/api/perfis/{id}", perfil).contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Gestor de perfis 2", "d", "perfis.gerenciar"))
                        .with(soPerfisGerenciar(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Gestor de perfis 2"));
    }

    @Test
    void criarPerfil_comMaisDe50Permissoes_devolve400() throws Exception {
        String[] codigos = new String[51];
        for (int i = 0; i < codigos.length; i++) {
            codigos[i] = "codigo." + i;
        }

        mockMvc.perform(post("/api/perfis").contentType(MediaType.APPLICATION_JSON)
                        .content(corpo("Novo", "d", codigos))
                        .with(UsuarioDeTeste.autenticadoComo(1, "Administrador")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.permissoes").value("A lista deve ter no máximo 50 permissões"));
    }

    private RequestPostProcessor soPerfisGerenciar(Integer empresaId) {
        return UsuarioDeTeste.autenticadoComPermissoes(empresaId, "Gestor", List.of(Permissoes.PERFIS_GERENCIAR));
    }

    private Integer perfilComPermissoes(Integer empresaId, String nome, String... codigos) {
        Perfil perfil = new Perfil(nome, "d", empresaRepository.getReferenceById(empresaId));
        perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(List.of(codigos))));
        return perfilRepository.save(perfil).getId();
    }

    private String corpo(String nome, String descricao, String... codigos) {
        String lista = Arrays.stream(codigos).map(c -> "\"" + c + "\"").collect(Collectors.joining(","));
        return "{\"nome\":\"" + nome + "\",\"descricao\":\"" + descricao + "\",\"permissoes\":[" + lista + "]}";
    }

    private Integer idDoPerfil(Integer empresaId, String nome) {
        return perfilRepository.findByNomeAndEmpresaId(nome, empresaId).orElseThrow().getId();
    }

    private void criarUsuario(Integer empresaId, Integer perfilId, boolean ativo) {
        Usuario usuario = new Usuario();
        usuario.setNome("Usuario Teste");
        usuario.setEmail("usuario" + perfilId + "@teste.com");
        usuario.setSenha("hash");
        usuario.setEmpresa(empresaRepository.getReferenceById(empresaId));
        usuario.setPerfil(perfilRepository.getReferenceById(perfilId));
        usuario.setAtivo(ativo);
        usuarioRepository.save(usuario);
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
