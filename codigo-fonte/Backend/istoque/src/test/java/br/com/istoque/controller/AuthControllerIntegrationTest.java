package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do login (POST /api/auth/login).
 *
 * Cobre os critérios de aceite de HU002 (#12): login com sucesso, senha
 * errada, e-mail inexistente, CNPJ errado e usuário desativado devem se
 * comportar como descrito na tabela de testes validada manualmente. Também
 * garante que o CNPJ pode ser digitado com ou sem máscara.
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
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Empresa empresa;

    /**
     * Antes de cada teste, limpa o banco e monta o cenário base: uma empresa
     * (o CNPJ fica gravado como 11.222.333/0001-81), um perfil Administrador e
     * um usuário ativo com a senha SENHA_CORRETA. Assim cada teste começa do
     * zero e não depende da ordem em que os outros rodam.
     */
    @BeforeEach
    void setUp() {
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();

        empresa = new Empresa();
        empresa.setRazaoSocial("Empresa Teste LTDA");
        empresa.setCnpj("11222333000181");
        empresa = empresaRepository.save(empresa);

        Perfil perfil = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresa));

        Usuario usuario = new Usuario();
        usuario.setNome("Usuario Teste");
        usuario.setEmail("usuario@teste.com");
        usuario.setSenha(passwordEncoder.encode(SENHA_CORRETA));
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);
        usuarioRepository.save(usuario);
    }

    /**
     * Caminho feliz: e-mail, CNPJ e senha corretos devolvem 200 com os dados
     * que o front-end usa depois do login (e-mail, perfil e nome da empresa).
     */
    @Test
    void loginComCredenciaisCorretas_devolve200ComDadosDoUsuario() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", empresa.getCnpj(), SENHA_CORRETA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("usuario@teste.com"))
                .andExpect(jsonPath("$.perfil").value("Administrador"))
                .andExpect(jsonPath("$.nomeEmpresa").value("Empresa Teste LTDA"));
    }

    /**
     * O CNPJ fica gravado com máscara, mas a pessoa pode digitar só os
     * números. Garante que o AuthService formata o CNPJ recebido antes de
     * procurar a empresa, senão a busca por texto exato não encontraria nada.
     */
    @Test
    void loginComCnpjSemMascara_devolve200() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "11222333000181", SENHA_CORRETA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("usuario@teste.com"));
    }

    /**
     * Senha errada devolve 401 com a mensagem genérica, sem dizer se o erro
     * está no e-mail ou na senha.
     */
    @Test
    void loginComSenhaErrada_devolve401ComMensagemPadrao() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", empresa.getCnpj(), "senhaErrada")))
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
                        .content(corpoLogin("naoexiste@teste.com", empresa.getCnpj(), "qualquer")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * O e-mail só vale junto com o CNPJ da empresa dele: o mesmo e-mail e a
     * mesma senha com outro CNPJ devolvem 401. Isso importa porque o mesmo
     * e-mail pode estar cadastrado em empresas diferentes.
     */
    @Test
    void loginComCnpjDeOutraEmpresa_devolve401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "00000000000000", SENHA_CORRETA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * Usuário desativado não entra, mesmo com a senha certa. A resposta é a
     * mesma mensagem genérica, sem revelar que a conta existe mas está inativa.
     */
    @Test
    void loginComUsuarioDesativado_devolve401MesmoComSenhaCerta() throws Exception {
        Usuario usuario = usuarioRepository.findByEmailAndEmpresaCnpj("usuario@teste.com", empresa.getCnpj())
                .orElseThrow();
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", empresa.getCnpj(), SENHA_CORRETA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    /**
     * Corpo vazio devolve 400 com uma mensagem para cada campo obrigatório
     * (email, cnpj e senha), vindas das validações do LoginRequestDTO.
     */
    @Test
    void loginComCamposFaltando_devolve400ComMensagensDeValidacao() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.email").exists())
                .andExpect(jsonPath("$.campos.cnpj").exists())
                .andExpect(jsonPath("$.campos.senha").exists());
    }

    /** Monta o JSON do corpo da requisição de login. */
    private String corpoLogin(String email, String cnpj, String senha) {
        return """
                {"email":"%s","cnpj":"%s","senha":"%s"}
                """.formatted(email, cnpj, senha);
    }
}
