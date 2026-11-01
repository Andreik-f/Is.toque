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

import java.util.HashSet;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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

    /** Monta o JSON do corpo da requisição de login. */
    private String corpoLogin(String email, String senha) {
        return """
                {"email":"%s","senha":"%s"}
                """.formatted(email, senha);
    }
}
