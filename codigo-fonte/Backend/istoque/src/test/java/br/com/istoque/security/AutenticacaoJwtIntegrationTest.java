package br.com.istoque.security;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.PermissaoRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.services.JwtService;
import com.jayway.jsonpath.JsonPath;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Testes de integração da autenticação por token JWT (HT001).
 *
 * Cobre os critérios de aceite da história: só login, cadastro e
 * /actuator/health funcionam sem token; sem token, com token inválido,
 * adulterado ou expirado, ou de um usuário desativado depois do login, a API
 * responde 401 no formato padrão de erro; com token válido, responde 200. Também
 * confere o que o login e o cadastro devolvem (token e expiraEm) e o que o
 * token guarda (usuário, empresa e perfil, nunca a senha).
 *
 * Diferente dos outros testes de controller, aqui NÃO se usa
 * @WithUsuarioAutenticado: o token passa pelo JwtAuthenticationFilter de verdade.
 * A rota protegida usada é GET /api/perfis.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AutenticacaoJwtIntegrationTest {

    private static final String SENHA = "SenhaCorreta123";
    private static final String MENSAGEM_401 = "Sessão expirada ou inválida. Entre novamente.";

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

    // mesma chave do JwtService, para o teste conseguir gerar um token expirado
    @Value("${jwt.secret}")
    private String chaveJwt;

    private Empresa empresa;

    /**
     * Antes de cada teste, limpa o banco e monta o cenário base: uma empresa,
     * um perfil Administrador e um usuário ativo com a senha SENHA.
     */
    @BeforeEach
    void setUp() {
        limparBanco();

        empresa = new Empresa();
        empresa.setRazaoSocial("Empresa Teste LTDA");
        empresa.setCnpj("11222333000181");
        empresa = empresaRepository.save(empresa);

        Perfil perfil = salvarPerfil("Administrador");

        Usuario usuario = new Usuario();
        usuario.setNome("Usuario Teste");
        usuario.setEmail("usuario@teste.com");
        usuario.setSenha(passwordEncoder.encode(SENHA));
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);
        usuarioRepository.save(usuario);
    }

    // os outros testes também limpam o banco; nada pode sobrar apontando para a empresa
    @AfterEach
    void tearDown() {
        limparBanco();
    }

    /** Rota pública: o login funciona sem token. */
    @Test
    void login_semToken_devolve200() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin()))
                .andExpect(status().isOk());
    }

    /** Rota pública: o cadastro funciona sem token. */
    @Test
    void cadastro_semToken_devolve201() throws Exception {
        mockMvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro()))
                .andExpect(status().isCreated());
    }

    /** Rota pública: o health check responde sem token. */
    @Test
    void health_semToken_devolve200() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    /** Rota protegida sem o cabeçalho Authorization devolve 401 no formato padrão de erro. */
    @Test
    void rotaProtegida_semToken_devolve401ComMensagemPadrao() throws Exception {
        mockMvc.perform(get("/api/perfis").param("empresaId", empresa.getId().toString()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value(MENSAGEM_401))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    /** O cabeçalho precisa ser "Bearer <token>": outro esquema é tratado como sem token. */
    @Test
    void rotaProtegida_comEsquemaDiferenteDeBearer_devolve401() throws Exception {
        mockMvc.perform(get("/api/perfis")
                        .param("empresaId", empresa.getId().toString())
                        .header("Authorization", "Basic " + tokenValido()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /** Texto qualquer no lugar do token devolve 401, e não 500. */
    @Test
    void rotaProtegida_comTokenInvalido_devolve401() throws Exception {
        acessarPerfis("isto-nao-e-um-jwt")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /** Token com o corpo trocado (assinatura antiga) é recusado. */
    @Test
    void rotaProtegida_comTokenAdulterado_devolve401() throws Exception {
        String[] partes = tokenValido().split("\\.");
        String corpoFalso = Base64.getUrlEncoder().withoutPadding().encodeToString(
                "{\"sub\":\"outro@teste.com\",\"usuarioId\":999,\"empresaId\":999,\"perfil\":\"Administrador\"}"
                        .getBytes(StandardCharsets.UTF_8));

        acessarPerfis(partes[0] + "." + corpoFalso + "." + partes[2])
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /** Token assinado com outra chave (não a da API) é recusado. */
    @Test
    void rotaProtegida_comTokenAssinadoComOutraChave_devolve401() throws Exception {
        String token = Jwts.builder()
                .subject("usuario@teste.com")
                .claim("usuarioId", usuarioId())
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(
                        "outra-chave-qualquer-com-32-bytes-ou-mais!".getBytes(StandardCharsets.UTF_8)))
                .compact();

        acessarPerfis(token)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /** Token com a assinatura certa, mas já vencido, é recusado. */
    @Test
    void rotaProtegida_comTokenExpirado_devolve401() throws Exception {
        // mesma chave da API, mas validade negativa: o token já nasce vencido
        JwtService geradorDeVencidos = new JwtService(chaveJwt, -1_000);
        String vencido = geradorDeVencidos
                .gerarToken("usuario@teste.com", usuarioId(), empresa.getId(), "Administrador")
                .token();

        acessarPerfis(vencido)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /**
     * A cada requisição a API confere no banco se o usuário continua ativo: o
     * mesmo token que funcionava passa a dar 401 depois da desativação.
     */
    @Test
    void rotaProtegida_depoisDeDesativarOUsuario_devolve401NaChamadaSeguinte() throws Exception {
        String token = tokenValido();
        acessarPerfis(token).andExpect(status().isOk());

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);

        acessarPerfis(token)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));
    }

    /** Token de um usuário que foi apagado também é recusado. */
    @Test
    void rotaProtegida_comTokenDeUsuarioApagado_devolve401() throws Exception {
        String token = tokenValido();
        usuarioRepository.deleteAll();

        acessarPerfis(token)
                .andExpect(status().isUnauthorized());
    }

    /** Caminho feliz: token válido devolve 200 e a lista de perfis da empresa. */
    @Test
    void rotaProtegida_comTokenValido_devolve200() throws Exception {
        acessarPerfis(tokenValido())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nome").value("Administrador"));
    }

    /**
     * Com token válido, rota que não existe e método não permitido continuam
     * devolvendo 404 e 405 (e não 401): o 401 não pode "engolir" os erros que
     * o front-end precisa ver.
     */
    @Test
    void rotaInexistenteEMetodoNaoSuportado_comTokenValido_naoViram401() throws Exception {
        String token = tokenValido();

        mockMvc.perform(get("/api/rota-que-nao-existe").header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/perfis").header("Authorization", "Bearer " + token))
                .andExpect(status().isMethodNotAllowed());
    }

    /**
     * O login devolve o token e a data de expiração, e o token vale 8 horas.
     * O expiraEm da resposta é o mesmo instante do "exp" de dentro do token.
     */
    @Test
    void login_devolveTokenEExpiraEmDeOitoHoras() throws Exception {
        OffsetDateTime antes = OffsetDateTime.now();

        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiraEm").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String token = JsonPath.read(resposta, "$.token");
        OffsetDateTime expiraEm = OffsetDateTime.parse(JsonPath.read(resposta, "$.expiraEm"));
        Claims claims = jwtService.validarToken(token);

        assertEquals(claims.getExpiration().toInstant(), expiraEm.toInstant());
        // 8h = 480 min; tolera os segundos do teste e o truncamento para segundos
        assertEquals(480, Duration.between(antes, expiraEm).toMinutes(), 1);
    }

    /** O cadastro também devolve o token: o usuário já sai do cadastro logado. */
    @Test
    void cadastro_devolveTokenQueFuncionaNasRotasProtegidas() throws Exception {
        String resposta = mockMvc.perform(post("/api/auth/cadastro")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoCadastro()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.expiraEm").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String token = JsonPath.read(resposta, "$.token");
        Integer empresaNovaId = JsonPath.read(resposta, "$.empresa.id");

        Claims claims = jwtService.validarToken(token);
        assertEquals(empresaNovaId, claims.get("empresaId", Integer.class));
        assertEquals("Administrador", claims.get("perfil", String.class));

        acessarPerfis(token, empresaNovaId).andExpect(status().isOk());
    }

    /** O token guarda o id do usuário, o da empresa e o perfil, e nunca a senha. */
    @Test
    void token_guardaUsuarioEmpresaEPerfilENuncaASenha() throws Exception {
        String token = tokenValido();
        Claims claims = jwtService.validarToken(token);

        assertEquals(usuarioId(), claims.get("usuarioId", Integer.class));
        assertEquals(empresa.getId(), claims.get("empresaId", Integer.class));
        assertEquals("Administrador", claims.get("perfil", String.class));
        assertEquals("usuario@teste.com", claims.getSubject());
        assertNotNull(claims.getExpiration());

        String corpoDoToken = new String(
                Base64.getUrlDecoder().decode(token.split("\\.")[1]), StandardCharsets.UTF_8);
        assertFalse(claims.containsKey("senha"));
        assertFalse(corpoDoToken.contains(SENHA));
        assertFalse(corpoDoToken.contains("$2a$"), "o hash da senha não pode ir no token");
    }

    private ResultActions acessarPerfis(String token) throws Exception {
        return acessarPerfis(token, empresa.getId());
    }

    private ResultActions acessarPerfis(String token, Integer empresaId) throws Exception {
        return mockMvc.perform(get("/api/perfis")
                .param("empresaId", empresaId.toString())
                .header("Authorization", "Bearer " + token));
    }

    /** Faz o login de verdade e devolve o token que a API entregou. */
    private String tokenValido() throws Exception {
        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.token");
    }

    /**
     * A permissão vem do perfil no banco a cada requisição: o Funcionário não cadastra
     * produto e, depois de o perfil ganhar produtos.gerenciar, a mesma chamada passa
     * com o mesmo token, sem novo login.
     */
    @Test
    void permissaoDadaAoPerfil_valeNoMesmoTokenSemNovoLogin() throws Exception {
        Perfil funcionario = salvarPerfil("Funcionário");
        Usuario usuario = new Usuario();
        usuario.setNome("Funcionario Teste");
        usuario.setEmail("funcionario@teste.com");
        usuario.setSenha(passwordEncoder.encode(SENHA));
        usuario.setEmpresa(empresa);
        usuario.setPerfil(funcionario);
        usuarioRepository.save(usuario);
        String resposta = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"funcionario@teste.com\",\"senha\":\"%s\"}".formatted(SENHA)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(resposta, "$.token");

        mockMvc.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON).content("{}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        funcionario.getPermissoes().add(permissaoRepository.findById(Permissoes.PRODUTOS_GERENCIAR).orElseThrow());
        perfilRepository.save(funcionario);

        mockMvc.perform(post("/api/produtos").contentType(MediaType.APPLICATION_JSON).content("{}")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }

    @Test
    void rotaProtegida_depoisDeTrocarAPropriaSenha_recusaOTokenAntigoEAceitaONovo() throws Exception {
        String tokenAntigo = tokenValido();

        mockMvc.perform(patch("/api/usuarios/me/senha")
                        .header("Authorization", "Bearer " + tokenAntigo)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"senhaAtual":"%s","novaSenha":"NovaSenhaValida123"}
                                """.formatted(SENHA)))
                .andExpect(status().isNoContent());

        acessarPerfis(tokenAntigo)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));

        String respostaNovoLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"usuario@teste.com","senha":"NovaSenhaValida123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String tokenNovo = JsonPath.read(respostaNovoLogin, "$.token");

        acessarPerfis(tokenNovo).andExpect(status().isOk());
    }

    @Test
    void rotaProtegida_depoisDeAdministradorAlterarASenha_recusaOTokenAntigoEAceitaONovo() throws Exception {
        String tokenAntigo = tokenValido();

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuarioId())
                        .header("Authorization", "Bearer " + tokenAntigo)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"NovaSenhaValida123"}
                                """))
                .andExpect(status().isNoContent());

        acessarPerfis(tokenAntigo)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_401));

        String respostaNovoLogin = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"usuario@teste.com","senha":"NovaSenhaValida123"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String tokenNovo = JsonPath.read(respostaNovoLogin, "$.token");

        acessarPerfis(tokenNovo).andExpect(status().isOk());
    }

    private Integer usuarioId() {
        return usuarioRepository.findByEmail("usuario@teste.com").orElseThrow().getId();
    }

    private Perfil salvarPerfil(String nome) {
        Perfil perfil = new Perfil(nome, "Perfil de teste", empresa);
        perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(
                Permissoes.MATRIZ_PADRAO.getOrDefault(nome, Set.of()))));
        return perfilRepository.save(perfil);
    }

    private void limparBanco() {
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
    }

    private String corpoLogin() {
        return """
                {"email":"usuario@teste.com","senha":"%s"}
                """.formatted(SENHA);
    }

    private String corpoCadastro() {
        return """
                {"razaoSocial":"Restaurante Exemplo LTDA","cnpj":"11444777000161","nome":"Dono do Restaurante","email":"dono@restaurante.com","senha":"SenhaValida123"}
                """;
    }
}
