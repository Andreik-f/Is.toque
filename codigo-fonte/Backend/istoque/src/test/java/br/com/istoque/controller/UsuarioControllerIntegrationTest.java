package br.com.istoque.controller;

import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.support.WithUsuarioAutenticado;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.PermissaoRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.security.Permissoes;
import br.com.istoque.security.RestAccessDeniedHandler;
import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.security.UsuarioAutenticado;
import br.com.istoque.services.JwtService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.anonymous;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do cadastro de usuários (POST /api/usuarios), da
 * edição (PUT /api/usuarios/{id}) e da troca de senha
 * (PATCH /api/usuarios/{id}/senha), além da troca da própria senha
 * (PATCH /api/usuarios/me/senha).
 *
 * Cobre os critérios de aceite de HU001 (#11), HT006 (#20), HT005 (#27),
 * HT013 (#37), HT016 (#40) e HT018 (#42): cadastro de usuário sem vazar senha,
 * e-mail único no sistema todo (inclusive entre empresas diferentes e sem
 * diferenciar maiúsculas), edição sem senha, 404/400 em vez de 500 para
 * empresa/perfil inexistentes ou de outra empresa, e troca de senha via
 * TrocaSenhaRequestDTO com validação de campo obrigatório.
 *
 * Cobre também o HU020 (#65): o usuário logado troca a própria senha informando a
 * atual. O usuário vem do token (aqui um JWT de verdade, pelo filtro, e não um
 * usuário simulado), a senha atual errada, a nova igual à atual ou curta
 * devolvem 400, e sem login a rota responde 401.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class UsuarioControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private PermissaoRepository permissaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private Empresa empresaA;
    private Empresa empresaB;
    private Perfil perfilAdminEmpresaA;
    private Perfil perfilAdminEmpresaB;

    private Perfil salvarPerfil(String nome, String descricao, Empresa empresa) {
        Perfil perfil = new Perfil(nome, descricao, empresa);
        perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(
                Permissoes.MATRIZ_PADRAO.getOrDefault(nome, Set.of()))));
        return perfilRepository.save(perfil);
    }

    /**
     * Antes de cada teste, limpa o banco e cria duas empresas (A e B), cada uma
     * com seu perfil Administrador. Duas empresas permitem testar as regras que
     * envolvem a empresa: e-mail único mesmo entre empresas, e perfil de uma
     * empresa não servir para a outra.
     */
    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();

        empresaA = new Empresa();
        empresaA.setRazaoSocial("Empresa A LTDA");
        empresaA.setCnpj("11111111000101");
        empresaA = empresaRepository.save(empresaA);

        empresaB = new Empresa();
        empresaB.setRazaoSocial("Empresa B LTDA");
        empresaB.setCnpj("22222222000102");
        empresaB = empresaRepository.save(empresaB);

        perfilAdminEmpresaA = salvarPerfil("Administrador", "Acesso total", empresaA);
        perfilAdminEmpresaB = salvarPerfil("Administrador", "Acesso total", empresaB);
    }

    /**
     * Cadastro válido devolve 201 com o cabeçalho Location (endereço do novo
     * usuário). A resposta não pode trazer a senha, nem mesmo o hash.
     */
    @Test
    void criarUsuario_comDadosValidos_devolve201SemSenhaNoCorpo() throws Exception {
        criarUsuario("Admin A", "admin@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.perfil").value("Administrador"));
    }

    /**
     * Dentro da mesma empresa o e-mail não pode se repetir: o segundo cadastro
     * com o mesmo e-mail devolve 409 (conflito).
     */
    @Test
    void criarUsuario_comEmailDuplicadoNaMesmaEmpresa_devolve409() throws Exception {
        criarUsuario("Admin A", "duplicado@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated());

        criarUsuario("Outro", "duplicado@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isConflict());
    }

    /**
     * O e-mail é único no sistema todo, mesmo em empresas diferentes: o login
     * é feito só com e-mail e senha, então o mesmo e-mail em duas empresas
     * deixaria o login sem saber de quem é a conta. Devolve 409 com a
     * mensagem de e-mail já cadastrado.
     */
    @Test
    void criarUsuario_comEmailJaUsadoEmOutraEmpresa_devolve409() throws Exception {
        criarUsuario("Admin A", "mesmoemail@teste.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated());

        criarUsuario("Admin B", "mesmoemail@teste.com", perfilAdminEmpresaB.getId(), empresaB.getId())
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Já existe um usuário cadastrado com o e-mail mesmoemail@teste.com."));
    }

    /**
     * O e-mail é gravado em minúsculas, então "Ana@Loja.com" e "ana@loja.com"
     * são a mesma conta: o segundo cadastro devolve 409.
     */
    @Test
    void criarUsuario_comEmailEmMaiusculas_gravaEmMinusculasEBloqueiaDuplicado() throws Exception {
        criarUsuario("Ana", "Ana@Loja.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("ana@loja.com"));

        criarUsuario("Outra Ana", "ana@loja.com", perfilAdminEmpresaB.getId(), empresaB.getId())
                .andExpect(status().isConflict());
    }

    /**
     * A regra vale também na edição: trocar o e-mail de um usuário para um
     * e-mail que já é de outra pessoa, mesmo de outra empresa, devolve 409.
     */
    @Test
    void atualizarUsuario_comEmailDeUsuarioDeOutraEmpresa_devolve409() throws Exception {
        criarUsuarioPersistido("Admin A", "ocupado@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);
        Usuario usuarioB = criarUsuarioPersistido("Admin B", "livre@empresab.com", "SenhaValida123",
                perfilAdminEmpresaB, empresaB);

        atualizarUsuario(usuarioB.getId(), "Admin B", "ocupado@empresaa.com",
                perfilAdminEmpresaB.getId(), empresaB.getId())
                .andExpect(status().isConflict());
    }

    /**
     * A edição não pede senha: nome, e-mail e perfil mudam com um PUT sem o
     * campo senha, que devolve 200.
     */
    @Test
    void atualizarUsuario_semSenha_devolve200() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        atualizarUsuario(usuario.getId(), "Admin A Editado", "novo@empresaa.com",
                perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Admin A Editado"))
                .andExpect(jsonPath("$.email").value("novo@empresaa.com"));
    }

    /**
     * Uma senha enviada no PUT é ignorada: a senha só muda pelo PATCH
     * /api/usuarios/{id}/senha. Depois do PUT, a senha antiga continua valendo.
     */
    @Test
    void atualizarUsuario_comSenhaNoCorpo_naoTrocaASenha() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", usuario.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Admin A","email":"admin@empresaa.com","senha":"SenhaNova456","perfilId":%d,"empresaId":%d}
                                """.formatted(perfilAdminEmpresaA.getId(), empresaA.getId())))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("admin@empresaa.com", "SenhaAntiga123")))
                .andExpect(status().isOk());
    }

    @Test
    void criarUsuario_comEmpresaIdDeOutraEmpresaNoCorpo_ignoraEUsaADoToken() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Outra Empresa","email":"outra@teste.com","senha":"SenhaValida123","perfilId":%d,"empresaId":%d}
                                """.formatted(perfilAdminEmpresaA.getId(), empresaB.getId())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.empresaId").value(empresaA.getId()));
    }

    @Test
    void atualizarUsuario_comEmpresaIdDeOutraEmpresaNoCorpo_mantemAEmpresaDoToken() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "fica@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", usuario.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Admin A","email":"fica@empresaa.com","perfilId":%d,"empresaId":%d}
                                """.formatted(perfilAdminEmpresaA.getId(), empresaB.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.empresaId").value(empresaA.getId()));
    }

    @Test
    void listarUsuarios_devolveSoOsDaEmpresaDoTokenEmOrdemDeNome() throws Exception {
        criarUsuarioPersistido("Bruno", "bruno@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);
        criarUsuarioPersistido("Ana", "ana@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);
        criarUsuarioPersistido("Carlos", "carlos@empresab.com", "SenhaValida123", perfilAdminEmpresaB, empresaB);

        mockMvc.perform(get("/api/usuarios").with(comoAdministradorDe(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("Ana"))
                .andExpect(jsonPath("$[1].nome").value("Bruno"));

        mockMvc.perform(get("/api/usuarios").param("empresaId", empresaA.getId().toString())
                        .with(comoAdministradorDe(empresaB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].nome").value("Carlos"));
    }

    @Test
    void usuarioDeOutraEmpresa_editarTrocarSenhaEInativar_devolve404ENaoAltera() throws Exception {
        Usuario usuarioB = criarUsuarioPersistido("Admin B", "adminb@empresab.com", "SenhaAntiga123",
                perfilAdminEmpresaB, empresaB);

        atualizarUsuario(usuarioB.getId(), "Nome Trocado", "trocado@empresab.com",
                perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Usuário não encontrado com ID: " + usuarioB.getId()));

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuarioB.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/usuarios/{id}", usuarioB.getId()).with(comoAdministradorDe(empresaA)))
                .andExpect(status().isNotFound());

        Usuario gravado = usuarioRepository.findById(usuarioB.getId()).orElseThrow();
        assertEquals("Admin B", gravado.getNome());
        assertTrue(gravado.getAtivo());
        assertTrue(passwordEncoder.matches("SenhaAntiga123", gravado.getSenha()));
    }

    @Test
    void inativarUsuario_daPropriaEmpresa_devolve204EDesativa() throws Exception {
        Perfil perfilFuncionario = salvarPerfil("Funcionário", "Movimentações", empresaA);
        Usuario usuario = criarUsuarioPersistido("Funcionario A", "func@empresaa.com", "SenhaValida123",
                perfilFuncionario, empresaA);

        mockMvc.perform(delete("/api/usuarios/{id}", usuario.getId()).with(comoAdministradorDe(empresaA)))
                .andExpect(status().isNoContent());

        assertFalse(usuarioRepository.findById(usuario.getId()).orElseThrow().getAtivo());
    }

    @ParameterizedTest
    @CsvSource({
            "POST, /api/usuarios",
            "GET, /api/usuarios",
            "PUT, /api/usuarios/1",
            "PATCH, /api/usuarios/1/senha",
            "DELETE, /api/usuarios/1"
    })
    void rotaDeUsuarios_semToken_devolve401(String metodo, String rota) throws Exception {
        mockMvc.perform(request(HttpMethod.valueOf(metodo), rota)
                        .with(anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(RestAuthenticationEntryPoint.MENSAGEM));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void criarUsuario_semSerAdministrador_devolve403ENaoCria(String perfil) throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), perfil))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Novo","email":"novo@empresaa.com","senha":"SenhaValida123","perfilId":%d}
                                """.formatted(perfilAdminEmpresaA.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertTrue(usuarioRepository.findByEmail("novo@empresaa.com").isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void atualizarUsuario_semSerAdministrador_devolve403ENaoAltera(String perfil) throws Exception {
        Usuario alvo = criarUsuarioPersistido("Admin A", "alvo@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", alvo.getId())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), perfil))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Nome Trocado","email":"alvo@empresaa.com","perfilId":%d}
                                """.formatted(perfilAdminEmpresaA.getId())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertEquals("Admin A", usuarioRepository.findById(alvo.getId()).orElseThrow().getNome());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void alterarSenha_semSerAdministrador_devolve403ENaoTroca(String perfil) throws Exception {
        Usuario alvo = criarUsuarioPersistido("Admin A", "alvo@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", alvo.getId())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), perfil))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertTrue(passwordEncoder.matches("SenhaAntiga123",
                usuarioRepository.findById(alvo.getId()).orElseThrow().getSenha()));
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void inativarUsuario_semSerAdministrador_devolve403ENaoInativa(String perfil) throws Exception {
        Usuario alvo = criarUsuarioPersistido("Admin A", "alvo@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(delete("/api/usuarios/{id}", alvo.getId())
                        .with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), perfil)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertTrue(usuarioRepository.findById(alvo.getId()).orElseThrow().getAtivo());
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void listarUsuarios_semUsuariosGerenciar_devolve403(String perfil) throws Exception {
        criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);

        mockMvc.perform(get("/api/usuarios").with(UsuarioDeTeste.autenticadoComo(empresaA.getId(), perfil)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));
    }

    @Test
    void inativarUsuario_aSiMesmo_devolve409ENaoInativa() throws Exception {
        Usuario admin = criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        criarUsuarioPersistido("Admin A2", "admin2@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);

        mockMvc.perform(delete("/api/usuarios/{id}", admin.getId())
                        .header("Authorization", "Bearer " + tokenDe(admin)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Você não pode inativar o seu próprio usuário."));

        assertTrue(usuarioRepository.findById(admin.getId()).orElseThrow().getAtivo());
    }

    @Test
    void inativarUsuario_ultimoAdministradorAtivo_devolve409ENaoInativa() throws Exception {
        Usuario unicoAdminAtivo = criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        Usuario adminInativo = criarUsuarioPersistido("Admin Antigo", "antigo@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        adminInativo.setAtivo(false);
        usuarioRepository.save(adminInativo);
        criarUsuarioPersistido("Admin B", "admin@empresab.com", "SenhaValida123", perfilAdminEmpresaB, empresaB);

        mockMvc.perform(delete("/api/usuarios/{id}", unicoAdminAtivo.getId())
                        .with(comoAdministradorDe(empresaA)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Não é possível inativar o último administrador ativo da empresa."));

        assertTrue(usuarioRepository.findById(unicoAdminAtivo.getId()).orElseThrow().getAtivo());
    }

    @Test
    void atualizarUsuario_trocandoPerfilDoUltimoAdministradorAtivo_devolve409ENaoAltera() throws Exception {
        Perfil perfilGerente = salvarPerfil("Gerente", "Gerencia estoque", empresaA);
        Usuario admin = criarUsuarioPersistido("Admin A", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", admin.getId())
                        .header("Authorization", "Bearer " + tokenDe(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Admin A","email":"admin@empresaa.com","perfilId":%d}
                                """.formatted(perfilGerente.getId())))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message")
                        .value("Não é possível alterar o perfil do último administrador ativo da empresa."));

        assertEquals("Administrador",
                usuarioRepository.findById(admin.getId()).orElseThrow().getPerfil().getNome());
    }

    @Test
    void comDoisAdministradores_inativarOOutro_devolve204() throws Exception {
        Usuario admin1 = criarUsuarioPersistido("Admin A1", "admin1@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        Usuario admin2 = criarUsuarioPersistido("Admin A2", "admin2@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(delete("/api/usuarios/{id}", admin2.getId())
                        .header("Authorization", "Bearer " + tokenDe(admin1)))
                .andExpect(status().isNoContent());

        assertFalse(usuarioRepository.findById(admin2.getId()).orElseThrow().getAtivo());
        assertTrue(usuarioRepository.findById(admin1.getId()).orElseThrow().getAtivo());
    }

    @Test
    void comDoisAdministradores_trocarOPerfilDeUm_devolve200() throws Exception {
        Perfil perfilGerente = salvarPerfil("Gerente", "Gerencia estoque", empresaA);
        Usuario admin1 = criarUsuarioPersistido("Admin A1", "admin1@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        Usuario admin2 = criarUsuarioPersistido("Admin A2", "admin2@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", admin2.getId())
                        .header("Authorization", "Bearer " + tokenDe(admin1))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"nome":"Admin A2","email":"admin2@empresaa.com","perfilId":%d}
                                """.formatted(perfilGerente.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("Gerente"));
    }

    /** perfilId que não existe devolve 400: o problema está no dado enviado. */
    @Test
    void criarUsuario_comPerfilInexistente_devolve400() throws Exception {
        criarUsuario("Sem Perfil", "semperfil@teste.com", 999999, empresaA.getId())
                .andExpect(status().isBadRequest());
    }

    /**
     * Um usuário da empresa A não pode receber um perfil da empresa B: devolve
     * 400. Isso impede que uma empresa use os perfis (e as permissões) de outra.
     */
    @Test
    void criarUsuario_comPerfilDeOutraEmpresa_devolve400() throws Exception {
        criarUsuario("Perfil Errado", "perfilerrado@teste.com", perfilAdminEmpresaB.getId(), empresaA.getId())
                .andExpect(status().isBadRequest());
    }

    /** Corpo vazio devolve 400, pelas validações do UsuarioCreateDTO. */
    @Test
    void criarUsuario_comCamposObrigatoriosAusentes_devolve400() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Troca de senha devolve 204 (sucesso, sem corpo). Depois confere pelo
     * próprio login que a senha nova funciona e que a antiga deixou de
     * funcionar.
     */
    @Test
    void alterarSenha_comSenhaValida_devolve204EPermiteLoginComNovaSenha() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "trocasenha@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin(usuario.getEmail(), "SenhaNova456")))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin(usuario.getEmail(), "SenhaAntiga123")))
                .andExpect(status().isUnauthorized());
    }

    /** Senha nova vazia devolve 400 com a mensagem do campo novaSenha. */
    @Test
    void alterarSenha_comNovaSenhaVazia_devolve400ComMensagemDeValidacao() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "senhavazia@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.novaSenha").value("A nova senha não pode estar vazia"));
    }

    /** JSON vazio, sem o campo novaSenha, devolve 400. */
    @Test
    void alterarSenha_comCorpoAusente_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "corpoausente@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .with(comoAdministradorDe(empresaA))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    /** Trocar a senha de um id que não existe devolve 404. */
    @Test
    void alterarSenha_comUsuarioInexistente_devolve404() throws Exception {
        mockMvc.perform(patch("/api/usuarios/{id}/senha", 999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNotFound());
    }

    /**
     * Chama POST /api/usuarios com os dados informados (a senha é sempre
     * válida) e devolve o resultado para o teste conferir.
     */
    private ResultActions criarUsuario(String nome, String email, Integer perfilId, Integer empresaId) throws Exception {
        String corpo = """
                {"nome":"%s","email":"%s","senha":"SenhaValida123","perfilId":%d}
                """.formatted(nome, email, perfilId);
        return mockMvc.perform(post("/api/usuarios")
                .with(UsuarioDeTeste.autenticadoComo(empresaId, "Administrador"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    /** Chama PUT /api/usuarios/{id} com os dados informados (a edição não leva senha). */
    private ResultActions atualizarUsuario(Integer id, String nome, String email, Integer perfilId, Integer empresaId)
            throws Exception {
        String corpo = """
                {"nome":"%s","email":"%s","perfilId":%d}
                """.formatted(nome, email, perfilId);
        return mockMvc.perform(put("/api/usuarios/{id}", id)
                .with(UsuarioDeTeste.autenticadoComo(empresaId, "Administrador"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    private RequestPostProcessor comoAdministradorDe(Empresa empresa) {
        return UsuarioDeTeste.autenticadoComo(empresa.getId(), "Administrador");
    }

    /**
     * Grava um usuário direto pelo repositório, sem passar pela API. Serve para
     * preparar o cenário dos testes de edição e de troca de senha.
     */
    private Usuario criarUsuarioPersistido(String nome, String email, String senha, Perfil perfil, Empresa empresa) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPerfil(perfil);
        usuario.setEmpresa(empresa);
        return usuarioRepository.save(usuario);
    }

    /** Monta o JSON do corpo da requisição de login. */
    private String corpoLogin(String email, String senha) {
        return """
                {"email":"%s","senha":"%s"}
                """.formatted(email, senha);
    }

    /** Token de verdade do usuário, o mesmo que o login devolve: passa pelo JwtAuthenticationFilter. */
    private String tokenDe(Usuario usuario) {
        return jwtService.gerarToken(usuario.getEmail(), usuario.getId(),
                usuario.getEmpresa().getId(), usuario.getPerfil().getNome()).token();
    }

    /** PATCH /api/usuarios/me/senha autenticado como o usuário, com o JSON informado. */
    private ResultActions trocarMinhaSenha(Usuario usuario, String json) throws Exception {
        return mockMvc.perform(patch("/api/usuarios/me/senha")
                .header("Authorization", "Bearer " + tokenDe(usuario))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    /**
     * HU020: troca de senha própria com sucesso devolve 204. O usuário é o do
     * token, e o login passa a funcionar com a nova senha e a falhar com a antiga.
     */
    @Test
    void trocarMinhaSenha_comDadosValidos_devolve204EPermiteLoginComNovaSenha() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "propria@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":"SenhaAntiga123","novaSenha":"SenhaNova456"}
                """)
                .andExpect(status().isNoContent());

        // a nova senha é gravada criptografada, nunca em texto
        String senhaGravada = usuarioRepository.findById(usuario.getId()).orElseThrow().getSenha();
        assertNotEquals("SenhaNova456", senhaGravada);
        assertTrue(passwordEncoder.matches("SenhaNova456", senhaGravada));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("propria@empresaa.com", "SenhaNova456")))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("propria@empresaa.com", "SenhaAntiga123")))
                .andExpect(status().isUnauthorized());
    }

    /** HU020: a rota vale para qualquer usuário logado, não só para o administrador. */
    @Test
    void trocarMinhaSenha_comPerfilQueNaoEAdministrador_devolve204() throws Exception {
        Perfil perfilOperador = salvarPerfil("Operador", "Acesso básico", empresaA);
        Usuario usuario = criarUsuarioPersistido("Operador A", "operador@empresaa.com", "SenhaAntiga123",
                perfilOperador, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":"SenhaAntiga123","novaSenha":"SenhaNova456"}
                """)
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("operador@empresaa.com", "SenhaNova456")))
                .andExpect(status().isOk());
    }

    /** HU020: a senha atual informada errada devolve 400 e não troca a senha. */
    @Test
    void trocarMinhaSenha_comSenhaAtualIncorreta_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "propria2@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":"SenhaErrada","novaSenha":"SenhaNova456"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Senha atual incorreta."));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("propria2@empresaa.com", "SenhaAntiga123")))
                .andExpect(status().isOk());
    }

    /** HU020: nova senha igual à atual devolve 400. */
    @Test
    void trocarMinhaSenha_comNovaSenhaIgualAAtual_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "propria3@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":"SenhaAntiga123","novaSenha":"SenhaAntiga123"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("A nova senha não pode ser igual à atual."));
    }

    /** HU020: nova senha com menos de 8 caracteres devolve 400 apontando o campo. */
    @Test
    void trocarMinhaSenha_comNovaSenhaCurta_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "propria4@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":"SenhaAntiga123","novaSenha":"1234567"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.novaSenha").value("A nova senha deve ter no mínimo 8 caracteres"));
    }

    /** HU020: senha atual em branco devolve 400 apontando o campo. */
    @Test
    void trocarMinhaSenha_comSenhaAtualEmBranco_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "propria5@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        trocarMinhaSenha(usuario, """
                {"senhaAtual":" ","novaSenha":"SenhaNova456"}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.senhaAtual").value("A senha atual não pode estar vazia"));
    }

    /** HU020: sem estar logado a rota responde 401, não 500. */
    @Test
    void trocarMinhaSenha_semEstarLogado_devolve401() throws Exception {
        mockMvc.perform(patch("/api/usuarios/me/senha")
                        .with(anonymous())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senhaAtual":"SenhaAntiga123","novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void usuarioSoComUsuariosGerenciar_colocandoASiMesmoNoAdministrador_devolve403() throws Exception {
        Perfil perfilGestor = perfilComPermissoes("Gestor", Permissoes.USUARIOS_GERENCIAR);
        Usuario gestor = criarUsuarioPersistido("Gestor", "gestor@empresaa.com", "SenhaValida123",
                perfilGestor, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", gestor.getId())
                        .with(UsuarioDeTeste.autenticadoComPermissoes(gestor.getId(), empresaA.getId(), "Gestor",
                                List.of(Permissoes.USUARIOS_GERENCIAR)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Gestor\",\"email\":\"gestor@empresaa.com\",\"perfilId\":"
                                + perfilAdminEmpresaA.getId() + "}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertEquals("Gestor", usuarioRepository.findById(gestor.getId()).orElseThrow().getPerfil().getNome());
    }

    @Test
    void usuarioSoComUsuariosGerenciar_criandoUsuarioAdministrador_devolve403() throws Exception {
        perfilComPermissoes("Gestor", Permissoes.USUARIOS_GERENCIAR);

        mockMvc.perform(post("/api/usuarios")
                        .with(UsuarioDeTeste.autenticadoComPermissoes(empresaA.getId(), "Gestor",
                                List.of(Permissoes.USUARIOS_GERENCIAR)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Novo\",\"email\":\"novo@empresaa.com\",\"senha\":\"SenhaValida123\","
                                + "\"perfilId\":" + perfilAdminEmpresaA.getId() + "}"))
                .andExpect(status().isForbidden());

        assertFalse(usuarioRepository.existsByEmail("novo@empresaa.com"));
    }

    @Test
    void usuarioSoComUsuariosGerenciar_atribuindoPerfilCujasPermissoesTem_devolve200() throws Exception {
        Perfil perfilGestor = perfilComPermissoes("Gestor", Permissoes.USUARIOS_GERENCIAR);
        Usuario outro = criarUsuarioPersistido("Outro", "outro@empresaa.com", "SenhaValida123",
                perfilComPermissoes("Sem permissões"), empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", outro.getId())
                        .with(UsuarioDeTeste.autenticadoComPermissoes(empresaA.getId(), "Gestor",
                                List.of(Permissoes.USUARIOS_GERENCIAR)))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Outro\",\"email\":\"outro@empresaa.com\",\"perfilId\":"
                                + perfilGestor.getId() + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.perfil").value("Gestor"));
    }

    @Test
    void usuarioSoComUsuariosGerenciar_trocandoSenhaDeAdministrador_devolve403ENaoAltera() throws Exception {
        Usuario admin = criarUsuarioPersistido("Admin", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        String hashAntes = admin.getSenha();

        mockMvc.perform(patch("/api/usuarios/{id}/senha", admin.getId())
                        .with(comSoUsuariosGerenciar())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"novaSenha\":\"SenhaInvasora789\"}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value(RestAccessDeniedHandler.MENSAGEM));

        assertEquals(hashAntes, usuarioRepository.findById(admin.getId()).orElseThrow().getSenha());
    }

    @Test
    void usuarioSoComUsuariosGerenciar_inativandoAdministrador_devolve403ENaoInativa() throws Exception {
        Usuario admin = criarUsuarioPersistido("Admin", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        criarUsuarioPersistido("Admin 2", "admin2@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);

        mockMvc.perform(delete("/api/usuarios/{id}", admin.getId()).with(comSoUsuariosGerenciar()))
                .andExpect(status().isForbidden());

        assertTrue(usuarioRepository.findById(admin.getId()).orElseThrow().getAtivo());
    }

    @Test
    void usuarioSoComUsuariosGerenciar_rebaixandoAdministrador_devolve403ENaoAltera() throws Exception {
        Perfil funcionario = perfilComPermissoes("Sem permissões");
        Usuario admin = criarUsuarioPersistido("Admin", "admin@empresaa.com", "SenhaValida123",
                perfilAdminEmpresaA, empresaA);
        criarUsuarioPersistido("Admin 2", "admin2@empresaa.com", "SenhaValida123", perfilAdminEmpresaA, empresaA);

        mockMvc.perform(put("/api/usuarios/{id}", admin.getId())
                        .with(comSoUsuariosGerenciar())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\":\"Admin\",\"email\":\"admin@empresaa.com\",\"perfilId\":"
                                + funcionario.getId() + "}"))
                .andExpect(status().isForbidden());

        assertEquals("Administrador",
                usuarioRepository.findById(admin.getId()).orElseThrow().getPerfil().getNome());
    }

    @Test
    void usuarioSoComUsuariosGerenciar_trocandoSenhaDeFuncionario_devolve204() throws Exception {
        Perfil funcionario = perfilComPermissoes("Sem permissões");
        Usuario alvo = criarUsuarioPersistido("Func", "func@empresaa.com", "SenhaValida123", funcionario, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", alvo.getId())
                        .with(comSoUsuariosGerenciar())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"novaSenha\":\"SenhaNova456\"}"))
                .andExpect(status().isNoContent());
    }

    private RequestPostProcessor comSoUsuariosGerenciar() {
        return UsuarioDeTeste.autenticadoComPermissoes(empresaA.getId(), "Gestor",
                List.of(Permissoes.USUARIOS_GERENCIAR));
    }

    private Perfil perfilComPermissoes(String nome, String... codigos) {
        Perfil perfil = new Perfil(nome, "Perfil de teste", empresaA);
        perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(List.of(codigos))));
        return perfilRepository.save(perfil);
    }

    /** HU020: usuário do contexto que não existe mais no banco devolve 404, não 500. */
    @Test
    void trocarMinhaSenha_comUsuarioInexistente_devolve404() throws Exception {
        UsuarioAutenticado fantasma = new UsuarioAutenticado(Integer.MAX_VALUE, "fantasma@empresaa.com",
                empresaA.getId(), "Administrador");

        mockMvc.perform(patch("/api/usuarios/me/senha")
                        .with(authentication(UsernamePasswordAuthenticationToken.authenticated(
                                fantasma, null, List.of())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senhaAtual":"SenhaAntiga123","novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNotFound());
    }
}
