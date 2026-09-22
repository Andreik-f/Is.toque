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
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Cobre os critérios de aceite de HU001 (#11), HT006 (#20) e HT005 (#27):
 * cadastro de usuário sem vazar senha, e-mail único por empresa (mas
 * repetível entre empresas diferentes), 404/400 em vez de 500 para
 * empresa/perfil inexistentes ou de outra empresa, e troca de senha via
 * TrocaSenhaRequestDTO com validação de campo obrigatório.
 */
@SpringBootTest
@AutoConfigureMockMvc
class UsuarioControllerIntegrationTest {

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

    private Empresa empresaA;
    private Empresa empresaB;
    private Perfil perfilAdminEmpresaA;
    private Perfil perfilAdminEmpresaB;

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

        perfilAdminEmpresaA = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresaA));
        perfilAdminEmpresaB = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresaB));
    }

    @Test
    void criarUsuario_comDadosValidos_devolve201SemSenhaNoCorpo() throws Exception {
        criarUsuario("Admin A", "admin@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.senha").doesNotExist())
                .andExpect(jsonPath("$.perfil").value("Administrador"));
    }

    @Test
    void criarUsuario_comEmailDuplicadoNaMesmaEmpresa_devolve409() throws Exception {
        criarUsuario("Admin A", "duplicado@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated());

        criarUsuario("Outro", "duplicado@empresaa.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isConflict());
    }

    @Test
    void criarUsuario_comMesmoEmailEmEmpresasDiferentes_devolve201NasDuas() throws Exception {
        criarUsuario("Admin A", "mesmoemail@teste.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated());

        criarUsuario("Admin B", "mesmoemail@teste.com", perfilAdminEmpresaB.getId(), empresaB.getId())
                .andExpect(status().isCreated());
    }

    @Test
    void criarUsuario_comEmpresaInexistente_devolve404() throws Exception {
        criarUsuario("Sem Empresa", "semempresa@teste.com", perfilAdminEmpresaA.getId(), 999999)
                .andExpect(status().isNotFound());
    }

    @Test
    void criarUsuario_comPerfilInexistente_devolve400() throws Exception {
        criarUsuario("Sem Perfil", "semperfil@teste.com", 999999, empresaA.getId())
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarUsuario_comPerfilDeOutraEmpresa_devolve400() throws Exception {
        criarUsuario("Perfil Errado", "perfilerrado@teste.com", perfilAdminEmpresaB.getId(), empresaA.getId())
                .andExpect(status().isBadRequest());
    }

    @Test
    void criarUsuario_comCamposObrigatoriosAusentes_devolve400() throws Exception {
        mockMvc.perform(post("/api/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void alterarSenha_comSenhaValida_devolve204EPermiteLoginComNovaSenha() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "trocasenha@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin(usuario.getEmail(), empresaA.getCnpj(), "SenhaNova456")))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(corpoLogin(usuario.getEmail(), empresaA.getCnpj(), "SenhaAntiga123")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void alterarSenha_comNovaSenhaVazia_devolve400ComMensagemDeValidacao() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "senhavazia@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":""}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.novaSenha").value("A nova senha não pode estar vazia"));
    }

    @Test
    void alterarSenha_comCorpoAusente_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "corpoausente@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void alterarSenha_comUsuarioInexistente_devolve404() throws Exception {
        mockMvc.perform(patch("/api/usuarios/{id}/senha", 999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"novaSenha":"SenhaNova456"}
                                """))
                .andExpect(status().isNotFound());
    }

    private ResultActions criarUsuario(String nome, String email, Integer perfilId, Integer empresaId) throws Exception {
        String corpo = """
                {"nome":"%s","email":"%s","senha":"SenhaValida123","perfilId":%d,"empresaId":%d}
                """.formatted(nome, email, perfilId, empresaId);
        return mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    private Usuario criarUsuarioPersistido(String nome, String email, String senha, Perfil perfil, Empresa empresa) {
        Usuario usuario = new Usuario();
        usuario.setNome(nome);
        usuario.setEmail(email);
        usuario.setSenha(passwordEncoder.encode(senha));
        usuario.setPerfil(perfil);
        usuario.setEmpresa(empresa);
        return usuarioRepository.save(usuario);
    }

    private String corpoLogin(String email, String cnpj, String senha) {
        return """
                {"email":"%s","cnpj":"%s","senha":"%s"}
                """.formatted(email, cnpj, senha);
    }
}
