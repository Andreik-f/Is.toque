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
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do cadastro de usuários (POST /api/usuarios) e da
 * troca de senha (PATCH /api/usuarios/{id}/senha).
 *
 * Cobre os critérios de aceite de HU001 (#11), HT006 (#20) e HT005 (#27):
 * cadastro de usuário sem vazar senha, e-mail único por empresa (mas
 * repetível entre empresas diferentes), 404/400 em vez de 500 para
 * empresa/perfil inexistentes ou de outra empresa, e troca de senha via
 * TrocaSenhaRequestDTO com validação de campo obrigatório.
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
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

    /**
     * Antes de cada teste, limpa o banco e cria duas empresas (A e B), cada uma
     * com seu perfil Administrador. Duas empresas permitem testar as regras que
     * dependem da empresa: e-mail único só dentro dela, e perfil de uma empresa
     * não servir para a outra.
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

        perfilAdminEmpresaA = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresaA));
        perfilAdminEmpresaB = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresaB));
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
     * Em empresas diferentes o mesmo e-mail é permitido, porque a regra de
     * e-mail único vale por empresa (por exemplo, alguém que trabalha em dois
     * restaurantes).
     */
    @Test
    void criarUsuario_comMesmoEmailEmEmpresasDiferentes_devolve201NasDuas() throws Exception {
        criarUsuario("Admin A", "mesmoemail@teste.com", perfilAdminEmpresaA.getId(), empresaA.getId())
                .andExpect(status().isCreated());

        criarUsuario("Admin B", "mesmoemail@teste.com", perfilAdminEmpresaB.getId(), empresaB.getId())
                .andExpect(status().isCreated());
    }

    /** empresaId que não existe devolve 404, e não um erro 500. */
    @Test
    void criarUsuario_comEmpresaInexistente_devolve404() throws Exception {
        criarUsuario("Sem Empresa", "semempresa@teste.com", perfilAdminEmpresaA.getId(), 999999)
                .andExpect(status().isNotFound());
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

    /** Senha nova vazia devolve 400 com a mensagem do campo novaSenha. */
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

    /** JSON vazio, sem o campo novaSenha, devolve 400. */
    @Test
    void alterarSenha_comCorpoAusente_devolve400() throws Exception {
        Usuario usuario = criarUsuarioPersistido("Admin A", "corpoausente@empresaa.com", "SenhaAntiga123",
                perfilAdminEmpresaA, empresaA);

        mockMvc.perform(patch("/api/usuarios/{id}/senha", usuario.getId())
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
                {"nome":"%s","email":"%s","senha":"SenhaValida123","perfilId":%d,"empresaId":%d}
                """.formatted(nome, email, perfilId, empresaId);
        return mockMvc.perform(post("/api/usuarios")
                .contentType(MediaType.APPLICATION_JSON)
                .content(corpo));
    }

    /**
     * Grava um usuário direto pelo repositório, sem passar pela API. Serve para
     * preparar o cenário dos testes de troca de senha.
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
    private String corpoLogin(String email, String cnpj, String senha) {
        return """
                {"email":"%s","cnpj":"%s","senha":"%s"}
                """.formatted(email, cnpj, senha);
    }
}
