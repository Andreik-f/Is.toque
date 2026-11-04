package br.com.istoque.controller;

import br.com.istoque.exception.FalhaNoEnvioDeSmsException;
import br.com.istoque.infrastructure.entity.CodigoVerificacao;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.repository.CodigoVerificacaoRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.services.sms.EnviadorSms;
import br.com.istoque.support.UsuarioDeTeste;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class TelefoneEmpresaIntegrationTest {

    private static final String CELULAR = "+5531987654321";
    private static final String FIXO = "+553133334444";
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

    @MockitoBean
    private EnviadorSms enviadorSms;

    private Empresa empresa;

    @BeforeEach
    void setUp() {
        codigoRepository.deleteAll();
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
        empresa = criarEmpresa(CELULAR);
    }

    @Test
    void atualizarEmpresa_comTelefoneInvalido_responde400() throws Exception {
        atualizar("123").andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.telefone").value("O telefone informado é inválido"));
        atualizar("abc").andExpect(status().isBadRequest());
    }

    @Test
    void atualizarEmpresa_comTelefoneNacionalOuInternacional_gravaEmE164() throws Exception {
        atualizar("(31) 98765-4321").andExpect(status().isOk())
                .andExpect(jsonPath("$.telefone").value("+5531987654321"));
        atualizar("+44 20 7183 8750").andExpect(status().isOk())
                .andExpect(jsonPath("$.telefone").value("+442071838750"));
        assertEquals("+442071838750", empresaRepository.findById(empresa.getId()).orElseThrow().getTelefone());
    }

    @Test
    void atualizarEmpresa_comTelefoneVazio_continuaPermitido() throws Exception {
        atualizar("").andExpect(status().isOk()).andExpect(jsonPath("$.telefone").doesNotExist());
        assertNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefone());
    }

    @Test
    void cadastro_comTelefone_gravaEmE164_eNaoEnviaSms() throws Exception {
        cadastrar("(31) 98765-4321", "a@teste.com", "11.222.333/0001-81")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.empresa.telefone").value("+5531987654321"))
                .andExpect(jsonPath("$.empresa.telefoneVerificadoEm").doesNotExist());
        verifyNoInteractions(enviadorSms);
    }

    @Test
    void cadastro_semTelefone_funcionaESemSms() throws Exception {
        cadastrar(null, "b@teste.com", "22.333.444/0001-81")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.empresa.telefone").doesNotExist());
        verifyNoInteractions(enviadorSms);
    }

    @Test
    void cadastro_comTelefoneInvalido_responde400() throws Exception {
        cadastrar("123", "c@teste.com", "33.444.555/0001-81")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.telefone").exists());
    }

    @Test
    void codigoCerto_confirmaOTelefone() throws Exception {
        String codigo = enviarCodigoECapturar();

        conferirCodigoGravadoSoComoHash(codigo);
        confirmar(codigo).andExpect(status().isNoContent());

        Empresa salva = empresaRepository.findById(empresa.getId()).orElseThrow();
        assertNotNull(salva.getTelefoneVerificadoEm());
        mockMvc.perform(get("/api/empresas/minha").with(administrador()))
                .andExpect(jsonPath("$.telefoneVerificadoEm").exists());
    }

    @Test
    void codigoErrado_responde400_eNaoConfirma() throws Exception {
        enviarCodigoECapturar();

        confirmar(CODIGO_ERRADO).andExpect(status().isBadRequest());

        assertNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefoneVerificadoEm());
        assertEquals(1, codigoRepository.findAll().get(0).getTentativas());
    }

    @Test
    void codigoVencido_responde400() throws Exception {
        String codigo = enviarCodigoECapturar();
        CodigoVerificacao salvo = codigoRepository.findAll().get(0);
        salvo.setExpiraEm(OffsetDateTime.now().minusMinutes(1));
        codigoRepository.save(salvo);

        confirmar(codigo).andExpect(status().isBadRequest());

        assertNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefoneVerificadoEm());
    }

    @Test
    void codigoReutilizado_responde400() throws Exception {
        String codigo = enviarCodigoECapturar();
        confirmar(codigo).andExpect(status().isNoContent());

        confirmar(codigo).andExpect(status().isBadRequest());
    }

    @Test
    void cincoTentativasErradas_invalidamOCodigo() throws Exception {
        String codigo = enviarCodigoECapturar();

        for (int i = 0; i < 5; i++) {
            confirmar(CODIGO_ERRADO).andExpect(status().isBadRequest());
        }
        confirmar(codigo).andExpect(status().isBadRequest());

        assertNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefoneVerificadoEm());
        assertTrue(codigoRepository.findAll().get(0).getUsado());
    }

    @Test
    void tentativasErradasEmParalelo_contamExatamenteCinco() throws Exception {
        String codigo = enviarCodigoECapturar();

        List<Integer> respostas = emParalelo(20, () -> statusDaConfirmacao(CODIGO_ERRADO));

        assertTrue(respostas.stream().allMatch(status -> status == 400));
        CodigoVerificacao salvo = codigoRepository.findAll().get(0);
        assertEquals(5, salvo.getTentativas());
        assertTrue(salvo.getUsado());
        confirmar(codigo).andExpect(status().isBadRequest());
    }

    @Test
    void mesmoCodigoCertoEmParalelo_confirmaUmaVezSo() throws Exception {
        String codigo = enviarCodigoECapturar();

        List<Integer> respostas = emParalelo(20, () -> statusDaConfirmacao(codigo));

        assertEquals(1, respostas.stream().filter(status -> status == 204).count());
        assertTrue(respostas.stream().allMatch(status -> status == 204 || status == 400));
        assertNotNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefoneVerificadoEm());
    }

    @Test
    void novoCodigoAntesDe60Segundos_responde429() throws Exception {
        enviarCodigo().andExpect(status().isNoContent());

        enviarCodigo().andExpect(status().isTooManyRequests());

        verify(enviadorSms, times(1)).enviar(eq(CELULAR), any());
    }

    @Test
    void sextoCodigoNaMesmaHora_responde429() throws Exception {
        for (int i = 0; i < 5; i++) {
            enviarCodigo().andExpect(status().isNoContent());
            recuarEnvios(2);
        }

        enviarCodigo().andExpect(status().isTooManyRequests());

        verify(enviadorSms, times(5)).enviar(eq(CELULAR), any());
    }

    @Test
    void novoCodigo_invalidaOAnterior() throws Exception {
        ArgumentCaptor<String> mensagem = ArgumentCaptor.forClass(String.class);
        enviarCodigo().andExpect(status().isNoContent());
        recuarEnvios(2);
        enviarCodigo().andExpect(status().isNoContent());
        verify(enviadorSms, times(2)).enviar(eq(CELULAR), mensagem.capture());
        String primeiro = extrairCodigo(mensagem.getAllValues().get(0));
        String segundo = extrairCodigo(mensagem.getAllValues().get(1));

        confirmar(primeiro).andExpect(status().isBadRequest());
        confirmar(segundo).andExpect(status().isNoContent());
    }

    @Test
    void trocarTelefone_zeraAConfirmacao_eInvalidaCodigoPendente() throws Exception {
        String codigo = enviarCodigoECapturar();
        confirmar(codigo).andExpect(status().isNoContent());
        enviarCodigo();
        recuarEnvios(2);
        enviarCodigo().andExpect(status().isNoContent());

        atualizar("+442071838750").andExpect(status().isOk())
                .andExpect(jsonPath("$.telefoneVerificadoEm").doesNotExist());

        assertNull(empresaRepository.findById(empresa.getId()).orElseThrow().getTelefoneVerificadoEm());
        assertTrue(codigoRepository.findAll().stream().allMatch(CodigoVerificacao::getUsado));
    }

    @Test
    void mesmoTelefoneEmOutroFormato_mantemAConfirmacao() throws Exception {
        confirmar(enviarCodigoECapturar()).andExpect(status().isNoContent());

        atualizar("(31) 98765-4321").andExpect(status().isOk())
                .andExpect(jsonPath("$.telefoneVerificadoEm").exists());
    }

    @Test
    void empresaSemTelefone_naoRecebeCodigo() throws Exception {
        empresa.setTelefone(null);
        empresaRepository.save(empresa);

        enviarCodigo().andExpect(status().isBadRequest());

        verifyNoInteractions(enviadorSms);
    }

    @Test
    void telefoneFixo_naoRecebeCodigo() throws Exception {
        empresa.setTelefone(FIXO);
        empresaRepository.save(empresa);

        enviarCodigo().andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Informe um celular para receber o código"));

        verifyNoInteractions(enviadorSms);
    }

    @Test
    void falhaNoEnvio_responde503_semGravarCodigoNemContarNoLimite() throws Exception {
        doThrow(new FalhaNoEnvioDeSmsException()).when(enviadorSms).enviar(any(), any());

        enviarCodigo().andExpect(status().isServiceUnavailable());

        assertEquals(0, codigoRepository.count());
        reset(enviadorSms);
        enviarCodigo().andExpect(status().isNoContent());
    }

    @Test
    void semEmpresaConfigurar_responde403() throws Exception {
        RequestPostProcessor funcionario = UsuarioDeTeste.autenticadoComo(empresa.getId(), "Funcionário");

        mockMvc.perform(post("/api/empresas/minha/telefone/codigo").with(funcionario))
                .andExpect(status().isForbidden());
        mockMvc.perform(post("/api/empresas/minha/telefone/confirmar").with(funcionario)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"codigo\":\"123456\"}"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(enviadorSms);
    }

    @Test
    void semLogin_responde401() throws Exception {
        mockMvc.perform(post("/api/empresas/minha/telefone/codigo")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/empresas/minha/telefone/confirmar")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"codigo\":\"123456\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void codigoComFormatoInvalido_responde400() throws Exception {
        confirmar("12").andExpect(status().isBadRequest());
        confirmar("abcdef").andExpect(status().isBadRequest());
    }

    private Empresa criarEmpresa(String telefone) {
        Empresa nova = new Empresa();
        nova.setRazaoSocial("Empresa Teste");
        nova.setCnpj("12.345.678/0001-90");
        nova.setTelefone(telefone);
        return empresaRepository.save(nova);
    }

    private RequestPostProcessor administrador() {
        return UsuarioDeTeste.autenticadoComo(empresa.getId(), "Administrador");
    }

    private ResultActions atualizar(String telefone) throws Exception {
        String corpo = "{\"razaoSocial\":\"Empresa Teste\",\"cnpj\":\"12345678000190\",\"telefone\":\""
                + telefone + "\"}";
        return mockMvc.perform(put("/api/empresas/minha").with(administrador())
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions cadastrar(String telefone, String email, String cnpj) throws Exception {
        String campoTelefone = telefone == null ? "" : ",\"telefone\":\"" + telefone + "\"";
        String corpo = "{\"razaoSocial\":\"Nova Empresa\",\"cnpj\":\"" + cnpj + "\",\"nome\":\"Maria\","
                + "\"email\":\"" + email + "\",\"senha\":\"SenhaForte123\"" + campoTelefone + "}";
        return mockMvc.perform(post("/api/auth/cadastro")
                .contentType(MediaType.APPLICATION_JSON).content(corpo));
    }

    private ResultActions enviarCodigo() throws Exception {
        return mockMvc.perform(post("/api/empresas/minha/telefone/codigo").with(administrador()));
    }

    private ResultActions confirmar(String codigo) throws Exception {
        return mockMvc.perform(post("/api/empresas/minha/telefone/confirmar").with(administrador())
                .contentType(MediaType.APPLICATION_JSON).content("{\"codigo\":\"" + codigo + "\"}"));
    }

    private int statusDaConfirmacao(String codigo) throws Exception {
        return confirmar(codigo).andReturn().getResponse().getStatus();
    }

    private List<Integer> emParalelo(int chamadas, Callable<Integer> chamada) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(chamadas);
        CountDownLatch largada = new CountDownLatch(1);
        try {
            List<Future<Integer>> futuros = new ArrayList<>();
            for (int i = 0; i < chamadas; i++) {
                futuros.add(pool.submit(() -> {
                    largada.await();
                    return chamada.call();
                }));
            }
            largada.countDown();
            List<Integer> respostas = new ArrayList<>();
            for (Future<Integer> futuro : futuros) {
                respostas.add(futuro.get());
            }
            return respostas;
        } finally {
            pool.shutdownNow();
        }
    }

    private String enviarCodigoECapturar() throws Exception {
        enviarCodigo().andExpect(status().isNoContent());
        ArgumentCaptor<String> mensagem = ArgumentCaptor.forClass(String.class);
        verify(enviadorSms).enviar(eq(CELULAR), mensagem.capture());
        return extrairCodigo(mensagem.getValue());
    }

    private String extrairCodigo(String mensagem) {
        Matcher encontrado = Pattern.compile("\\d{6}").matcher(mensagem);
        assertTrue(encontrado.find());
        return encontrado.group();
    }

    private void conferirCodigoGravadoSoComoHash(String codigo) {
        List<CodigoVerificacao> codigos = codigoRepository.findAll();
        assertEquals(1, codigos.size());
        assertNotEquals(codigo, codigos.get(0).getCodigoHash());
        assertTrue(codigos.get(0).getExpiraEm().isAfter(OffsetDateTime.now().plusMinutes(9)));
    }

    private void recuarEnvios(int minutos) {
        List<CodigoVerificacao> codigos = codigoRepository.findAll();
        codigos.forEach(c -> c.setEnviadoEm(c.getEnviadoEm().minusMinutes(minutos)));
        codigoRepository.saveAll(codigos);
    }
}
