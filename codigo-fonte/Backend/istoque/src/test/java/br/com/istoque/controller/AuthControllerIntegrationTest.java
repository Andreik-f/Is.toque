package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.PermissaoRepository;
import br.com.istoque.security.Permissoes;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do login (POST /api/auth/login).
 *
 * Cobre os critérios de aceite de HU002 (#12), HT021 (#46), HT016 (#40) e
 * HT017 (#41): o login é feito só com e-mail e senha, o e-mail não
 * diferencia maiúsculas e minúsculas, o login não conta como alteração do
 * cadastro, e login com sucesso, senha errada, e-mail inexistente e usuário
 * desativado devem se comportar como descrito na tabela de testes validada
 * manualmente.
 *
 * Cada teste sobe a aplicação inteira com um banco H2 em memória (configurado
 * em src/test/resources/application.properties) e simula as requisições HTTP
 * com o MockMvc, sem abrir porta de rede e sem tocar no banco do Neon.
 */
@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    private static final String SENHA_CORRETA = "SenhaCorreta123";
    private static final String MENSAGEM_ERRO_PADRAO = "E-mail ou senha incorretos.";
    private static final String MENSAGEM_CONTA_BLOQUEADA = "Muitas tentativas. Tente novamente mais tarde.";

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
    private JdbcTemplate jdbcTemplate;

    /**
     * Antes de cada teste, limpa o banco e monta o cenário base: uma empresa,
     * um perfil Administrador e um usuário ativo com a senha SENHA_CORRETA.
     * Assim cada teste começa do zero e não depende da ordem em que os outros
     * rodam.
     */
    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();

        Empresa empresa = new Empresa();
        empresa.setRazaoSocial("Empresa Teste LTDA");
        empresa.setCnpj("11222333000181");
        empresa = empresaRepository.save(empresa);

        Perfil perfil = new Perfil("Administrador", "Acesso total", empresa);
        perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(Permissoes.MATRIZ_PADRAO.get("Administrador"))));
        perfil = perfilRepository.save(perfil);

        Usuario usuario = new Usuario();
        usuario.setNome("Usuario Teste");
        usuario.setEmail("usuario@teste.com");
        usuario.setSenha(passwordEncoder.encode(SENHA_CORRETA));
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);
        usuarioRepository.save(usuario);
    }

    /**
     * Caminho feliz: e-mail e senha corretos devolvem 200 com os dados que o
     * front-end usa depois do login (e-mail, perfil e nome da empresa). A
     * empresa vem do próprio usuário, sem precisar informar o CNPJ.
     */
    @Test
    void loginComCredenciaisCorretas_devolve200ComDadosDoUsuario() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("usuario@teste.com"))
                .andExpect(jsonPath("$.perfil").value("Administrador"))
                .andExpect(jsonPath("$.nomeEmpresa").value("Empresa Teste LTDA"))
                .andExpect(jsonPath("$.permissoes.length()").value(9))
                .andExpect(jsonPath("$.permissoes[0]").value("empresa.configurar"))
                .andExpect(jsonPath("$.permissoes[8]").value("usuarios.gerenciar"));
    }

    /**
     * O e-mail não diferencia maiúsculas e minúsculas: quem se cadastrou como
     * usuario@teste.com também entra digitando USUARIO@Teste.com.
     */
    @Test
    void loginComEmailEmMaiusculas_devolve200() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("USUARIO@Teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("usuario@teste.com"));
    }

    /**
     * O login grava o último acesso, mas não é uma alteração no cadastro: o
     * atualizadoEm do usuário não pode mudar. O teste apaga as duas datas
     * direto no banco e confere que, depois do login, só o último acesso foi
     * preenchido.
     */
    @Test
    void login_registraUltimoAcessoSemAlterarAtualizadoEm() throws Exception {
        jdbcTemplate.update("update usuario set atualizado_em = null, ultimo_acesso = null");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk());

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertNotNull(usuario.getUltimoAcesso());
        assertNull(usuario.getAtualizadoEm());
    }

    /**
     * Senha errada devolve 401 com a mensagem genérica, sem dizer se o erro
     * está no e-mail ou na senha.
     */
    @Test
    void loginComSenhaErrada_devolve401ComMensagemPadrao() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * E-mail sem cadastro devolve exatamente a mesma resposta da senha errada.
     * Se as mensagens fossem diferentes, alguém poderia descobrir quais
     * e-mails estão cadastrados testando um por um.
     */
    @Test
    void loginComEmailInexistente_devolve401ComMesmaMensagemDaSenhaErrada() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("naoexiste@teste.com", "qualquer")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * Usuário desativado não entra, mesmo com a senha certa. A resposta é a
     * mesma mensagem genérica, sem revelar que a conta existe mas está inativa.
     */
    @Test
    void loginComUsuarioDesativado_devolve401MesmoComSenhaCerta() throws Exception {
        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * Corpo vazio devolve 400 com uma mensagem para cada campo obrigatório
     * (email e senha), vindas das validações do LoginRequestDTO. O CNPJ não
     * faz mais parte do login.
     */
    @Test
    void loginComCamposFaltando_devolve400ComMensagensDeValidacao() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").exists())
                .andExpect(jsonPath("$.campos.senha").exists())
                .andExpect(jsonPath("$.campos.cnpj").doesNotExist());
    }

    /** HT036: 5 senhas erradas seguidas bloqueiam a conta na 5ª tentativa, que ainda devolve 401. */
    @Test
    void loginComCincoSenhasErradas_bloqueiaAContaNaQuintaTentativa() throws Exception {
        for (int i = 1; i <= 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));

            Usuario parcial = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
            assertEquals(i, parcial.getTentativasFalhas());
            assertNull(parcial.getBloqueadoAte());
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));

        Usuario bloqueado = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertEquals(0, bloqueado.getTentativasFalhas());
        assertNotNull(bloqueado.getBloqueadoAte());
        assertTrue(bloqueado.getBloqueadoAte().isAfter(OffsetDateTime.now()));
    }

    /** HT036: enquanto o bloqueio estiver vigente, o login devolve 429 mesmo com a senha certa. */
    @Test
    void loginComContaBloqueada_devolve429MesmoComSenhaCerta() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value(MENSAGEM_CONTA_BLOQUEADA));
    }

    /** HT036: depois de expirar o prazo de bloqueio, o login com a senha certa volta a devolver 200. */
    @Test
    void loginAposExpirarOBloqueio_devolve200ELimpaBloqueadoAte() throws Exception {
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        usuario.setBloqueadoAte(OffsetDateTime.now().minusMinutes(1));
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk());

        Usuario desbloqueado = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertNull(desbloqueado.getBloqueadoAte());
        assertEquals(0, desbloqueado.getTentativasFalhas());
    }

    /** HT036: um login correto zera o contador de falhas anteriores. */
    @Test
    void loginComSucesso_zeraTentativasFalhasEAceitaMaisQuatroErrosSemBloquear() throws Exception {
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }
        assertEquals(3, usuarioRepository.findByEmail("usuario@teste.com").orElseThrow().getTentativasFalhas());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk());

        assertEquals(0, usuarioRepository.findByEmail("usuario@teste.com").orElseThrow().getTentativasFalhas());

        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertEquals(4, usuario.getTentativasFalhas());
        assertNull(usuario.getBloqueadoAte());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk());
    }

    /** HT036: se a última falha foi há mais de 15 minutos, a próxima falha recomeça a contagem em 1. */
    @Test
    void loginAposJanelaDeFalhasExpirar_reiniciaOContador() throws Exception {
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        usuario.setUltimaFalhaEm(OffsetDateTime.now().minusMinutes(16));
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                .andExpect(status().isUnauthorized());

        Usuario recarregado = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertEquals(1, recarregado.getTentativasFalhas());
        assertNull(recarregado.getBloqueadoAte());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isOk());
    }

    /** HT036: se a última falha ainda está dentro da janela de 15 minutos, a 5ª falha bloqueia a conta. */
    @Test
    void loginDentroDaJanelaDeFalhas_aindaBloqueiaNaQuintaFalha() throws Exception {
        for (int i = 0; i < 4; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                    .andExpect(status().isUnauthorized());
        }

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        usuario.setUltimaFalhaEm(OffsetDateTime.now().minusMinutes(14));
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                .andExpect(status().isUnauthorized());

        Usuario bloqueado = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertNotNull(bloqueado.getBloqueadoAte());
        assertTrue(bloqueado.getBloqueadoAte().isAfter(OffsetDateTime.now()));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", SENHA_CORRETA)))
                .andExpect(status().isTooManyRequests());
    }

    /**
     * HT036: errar a senha grava a tentativa, mas não é uma alteração no cadastro,
     * então o atualizadoEm do usuário não pode mudar.
     */
    @Test
    void loginComSenhaErrada_registraTentativaSemAlterarAtualizadoEm() throws Exception {
        jdbcTemplate.update("update usuario set atualizado_em = null");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                .andExpect(status().isUnauthorized());

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertEquals(1, usuario.getTentativasFalhas());
        assertNull(usuario.getAtualizadoEm());
    }

    /**
     * HT036: senhas erradas simultâneas da mesma conta não podem perder contagem.
     * Quatro tentativas disparadas juntas ficam abaixo do limite, então todas
     * respondem 401 e o contador tem que chegar a 4.
     */
    @Test
    void senhasErradasSimultaneas_naoPerdemContagem() throws Exception {
        int tentativas = 4;
        ExecutorService pool = Executors.newFixedThreadPool(tentativas);
        try {
            CountDownLatch largada = new CountDownLatch(1);
            List<Future<Integer>> respostas = new ArrayList<>();
            for (int i = 0; i < tentativas; i++) {
                respostas.add(pool.submit(() -> {
                    largada.await();
                    return mockMvc.perform(post("/api/auth/login")
                                    .contentType(MediaType.APPLICATION_JSON)
                                    .content(corpoLogin("usuario@teste.com", "senhaErrada")))
                            .andReturn().getResponse().getStatus();
                }));
            }
            largada.countDown();

            for (Future<Integer> resposta : respostas) {
                assertEquals(401, resposta.get(60, TimeUnit.SECONDS));
            }
        } finally {
            pool.shutdownNow();
        }

        Usuario usuario = usuarioRepository.findByEmail("usuario@teste.com").orElseThrow();
        assertEquals(tentativas, usuario.getTentativasFalhas());
        assertNull(usuario.getBloqueadoAte());
    }

    /** Monta o JSON do corpo da requisição de login. */
    private String corpoLogin(String email, String senha) {
        return """
                {"email":"%s","senha":"%s"}
                """.formatted(email, senha);
    }
}
