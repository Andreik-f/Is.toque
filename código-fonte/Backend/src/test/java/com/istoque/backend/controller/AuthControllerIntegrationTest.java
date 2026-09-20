package com.istoque.backend.controller;

import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.Perfil;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.PerfilRepository;
import com.istoque.backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Cobre os critérios de aceite de HU002 (#12): login com sucesso, senha
 * errada, e-mail inexistente, CNPJ errado e usuário desativado devem se
 * comportar como descrito na tabela de testes validada manualmente.
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

    @Test
    void loginComSenhaErrada_devolve401ComMensagemPadrao() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", empresa.getCnpj(), "senhaErrada")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    @Test
    void loginComEmailInexistente_devolve401ComMesmaMensagemDaSenhaErrada() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("naoexiste@teste.com", empresa.getCnpj(), "qualquer")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

    @Test
    void loginComCnpjDeOutraEmpresa_devolve401() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin("usuario@teste.com", "00000000000000", SENHA_CORRETA)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value(MENSAGEM_ERRO_PADRAO));
    }

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

    private String corpoLogin(String email, String cnpj, String senha) {
        return """
                {"email":"%s","cnpj":"%s","senha":"%s"}
                """.formatted(email, cnpj, senha);
    }
}
