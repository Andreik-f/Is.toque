package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.CodigoVerificacao;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.CodigoVerificacaoRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.services.sms.EnviadorSms;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RecuperacaoSenhaIntegrationTest {

    private static final String CELULAR = "+5531987654321";
    private static final String EMAIL = "maria@teste.com";
    private static final String SENHA_ANTIGA = "SenhaAntiga123";
    private static final String SENHA_NOVA = "SenhaNova456";
    private static final String CODIGO_ERRADO = "000000";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CodigoVerificacaoRepository codigoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @MockitoBean
    private EnviadorSms enviadorSms;

    private Empresa empresa;
    private Perfil perfil;
    private Usuario usuario;

    @BeforeEach
    void setUp() {
        codigoRepository.deleteAll();
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
        empresa = new Empresa();
        empresa.setRazaoSocial("Empresa Teste");
        empresa.setCnpj("12.345.678/0001-90");
        empresa.setTelefone(CELULAR);
        empresa.setTelefoneVerificadoEm(OffsetDateTime.now());
        empresa = empresaRepository.save(empresa);
        perfil = perfilRepository.save(new Perfil("Administrador", "Acesso total", empresa));
        usuario = criarUsuario("Maria", EMAIL);
    }

    @Test
    void emailInexistente_responde204_semEnviar() throws Exception {
        pedir("ninguem@teste.com").andExpect(status().isNoContent());

        verifyNoInteractions(enviadorSms);
    }

    @Test
    void usuarioDesativado_responde204_semEnviar() throws Exception {
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);

        pedir(EMAIL).andExpect(status().isNoContent());

        verifyNoInteractions(enviadorSms);
    }

    @Test
    void empresaSemTelefoneConfirmado_responde204_semEnviar() throws Exception {
        empresa.setTelefoneVerificadoEm(null);
        empresaRepository.save(empresa);

        pedir(EMAIL).andExpect(status().isNoContent());

        verifyNoInteractions(enviadorSms);
    }

    @Test
    void codigoCerto_trocaASenha_eDerrubaASenhaEOTokenAntigos() throws Exception {
        String tokenAntigo = JsonPath.read(
                entrar(SENHA_ANTIGA).andReturn().getResponse().getContentAsString(), "$.token");
        comToken(tokenAntigo).andExpect(status().isOk());
        String codigo = pedirECapturar();
        assertNotEquals(codigo, codigoRepository.findAll().get(0).getCodigoHash());

        confirmar(EMAIL, codigo, SENHA_NOVA).andExpect(status().isNoContent());

        entrar(SENHA_NOVA).andExpect(status().isOk());
        entrar(SENHA_ANTIGA).andExpect(status().isUnauthorized());
        comToken(tokenAntigo).andExpect(status().isUnauthorized());
    }

    @Test
    void codigoErrado_ouEmailDesconhecido_respondemOMesmo400() throws Exception {
        pedirECapturar();

        esperarRecusa(confirmar(EMAIL, CODIGO_ERRADO, SENHA_NOVA));
        esperarRecusa(confirmar("ninguem@teste.com", CODIGO_ERRADO, SENHA_NOVA));

        entrar(SENHA_ANTIGA).andExpect(status().isOk());
    }

    @Test
    void codigoVencido_responde400() throws Exception {
        String codigo = pedirECapturar();
        CodigoVerificacao gravado = codigoRepository.findAll().get(0);
        gravado.setExpiraEm(OffsetDateTime.now().minusMinutes(1));
        codigoRepository.save(gravado);

        esperarRecusa(confirmar(EMAIL, codigo, SENHA_NOVA));
    }

    @Test
    void codigoReutilizado_responde400() throws Exception {
        String codigo = pedirECapturar();
        confirmar(EMAIL, codigo, SENHA_NOVA).andExpect(status().isNoContent());

        esperarRecusa(confirmar(EMAIL, codigo, "OutraSenha789"));
    }

    @Test
    void senhaComMenosDe8Caracteres_responde400_semGastarOCodigo() throws Exception {
        String codigo = pedirECapturar();

        confirmar(EMAIL, codigo, "1234567").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.novaSenha").exists());

        confirmar(EMAIL, codigo, SENHA_NOVA).andExpect(status().isNoContent());
    }

    @Test
    void cincoCodigosErrados_invalidamOCodigo_eBloqueiamOLogin() throws Exception {
        String codigo = pedirECapturar();

        for (int i = 0; i < 5; i++) {
            esperarRecusa(confirmar(EMAIL, CODIGO_ERRADO, SENHA_NOVA));
        }

        esperarRecusa(confirmar(EMAIL, codigo, SENHA_NOVA));
        entrar(SENHA_ANTIGA).andExpect(status().isTooManyRequests());
    }

    @Test
    void contaBloqueada_recuperaASenha_eVoltaAEntrar() throws Exception {
        usuario.setBloqueadoAte(OffsetDateTime.now().plusMinutes(30));
        usuarioRepository.save(usuario);

        confirmar(EMAIL, pedirECapturar(), SENHA_NOVA).andExpect(status().isNoContent());

        entrar(SENHA_NOVA).andExpect(status().isOk());
    }

    @Test
    void novoPedidoAntesDe60Segundos_responde429() throws Exception {
        pedir(EMAIL).andExpect(status().isNoContent());

        pedir(EMAIL).andExpect(status().isTooManyRequests());

        verify(enviadorSms, times(1)).enviar(any(), any());
    }

    @Test
    void sextoPedidoDoEmailNaMesmaHora_responde429() throws Exception {
        pedirCincoVezes(EMAIL);

        pedir(EMAIL).andExpect(status().isTooManyRequests());

        verify(enviadorSms, times(5)).enviar(any(), any());
    }

    @Test
    void decimoPrimeiroPedidoDaEmpresaNaMesmaHora_responde429() throws Exception {
        criarUsuario("Joao", "joao@teste.com");
        criarUsuario("Ana", "ana@teste.com");
        pedirCincoVezes(EMAIL);
        pedirCincoVezes("joao@teste.com");

        pedir("ana@teste.com").andExpect(status().isTooManyRequests());

        verify(enviadorSms, times(10)).enviar(any(), any());
    }

    private Usuario criarUsuario(String nome, String email) {
        Usuario novo = new Usuario();
        novo.setNome(nome);
        novo.setEmail(email);
        novo.setSenha(passwordEncoder.encode(SENHA_ANTIGA));
        novo.setPerfil(perfil);
        novo.setEmpresa(empresa);
        return usuarioRepository.save(novo);
    }

    private ResultActions pedir(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/recuperar-senha")
                .contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"" + email + "\"}"));
    }

    private ResultActions confirmar(String email, String codigo, String novaSenha) throws Exception {
        return mockMvc.perform(post("/api/auth/recuperar-senha/confirmar").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"codigo\":\"%s\",\"novaSenha\":\"%s\"}".formatted(email, codigo, novaSenha)));
    }

    private ResultActions entrar(String senha) throws Exception {
        return mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"%s\",\"senha\":\"%s\"}".formatted(EMAIL, senha)));
    }

    private ResultActions comToken(String token) throws Exception {
        return mockMvc.perform(get("/api/empresas/minha").header("Authorization", "Bearer " + token));
    }

    // toda falha da confirmação tem a mesma resposta, para não revelar quais contas existem
    private void esperarRecusa(ResultActions resposta) throws Exception {
        resposta.andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Código inválido ou vencido"));
    }

    private String pedirECapturar() throws Exception {
        pedir(EMAIL).andExpect(status().isNoContent());
        ArgumentCaptor<String> mensagem = ArgumentCaptor.forClass(String.class);
        verify(enviadorSms).enviar(eq(CELULAR), mensagem.capture());
        assertTrue(mensagem.getValue().contains("Maria") && mensagem.getValue().contains(EMAIL));
        Matcher encontrado = Pattern.compile("\\d{6}").matcher(mensagem.getValue());
        assertTrue(encontrado.find());
        return encontrado.group();
    }

    private void pedirCincoVezes(String email) throws Exception {
        for (int i = 0; i < 5; i++) {
            pedir(email).andExpect(status().isNoContent());
            List<CodigoVerificacao> codigos = codigoRepository.findAll();
            codigos.forEach(codigo -> codigo.setEnviadoEm(codigo.getEnviadoEm().minusMinutes(2)));
            codigoRepository.saveAll(codigos);
        }
    }
}
