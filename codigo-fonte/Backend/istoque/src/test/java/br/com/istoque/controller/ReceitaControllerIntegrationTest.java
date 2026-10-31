package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Produto;
import br.com.istoque.infrastructure.entity.TipoProduto;
import br.com.istoque.infrastructure.entity.UnidadeMedida;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import br.com.istoque.security.UsuarioAutenticado;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cobre o RF-20 e o RF-21 (PR #117): cadastro e edição da ficha técnica da
 * receita. Protege o isolamento por empresa (a empresa vem do usuário logado,
 * receita ou produto de outra empresa responde 404), o nome único entre as
 * receitas ativas (409), a proibição de produto repetido (400) e a edição dos
 * itens sem violar a chave (receita, produto).
 *
 * Roda com H2 em memória e MockMvc, dentro de uma transação desfeita ao fim de
 * cada teste.
 */
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ReceitaControllerIntegrationTest {

    private static final AtomicInteger SEQUENCIA = new AtomicInteger();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EmpresaRepository empresaRepository;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private UnidadeMedidaRepository unidadeMedidaRepository;

    @Autowired
    private EntityManager entityManager;

    private Empresa empresaA;
    private Empresa empresaB;
    private UnidadeMedida unidade;
    private Produto farinha;
    private Produto acucar;
    private Produto produtoInativo;
    private Produto produtoEmpresaB;

    @BeforeEach
    void setUp() {
        empresaA = criarEmpresa("A");
        empresaB = criarEmpresa("B");

        unidade = new UnidadeMedida();
        unidade.setSigla("kgR");
        unidade.setNome("Quilograma de receita");
        unidade = unidadeMedidaRepository.save(unidade);

        farinha = criarProduto("Farinha", true, empresaA);
        acucar = criarProduto("Açúcar", true, empresaA);
        produtoInativo = criarProduto("Fermento", false, empresaA);
        produtoEmpresaB = criarProduto("Leite", true, empresaB);
    }

    @Test
    void cadastrar_comDadosValidos_devolve201ComLocation() throws Exception {
        cadastrar(empresaA, corpo("Bolo de Cenoura", itens(farinha, "2.5")))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.nome").value("Bolo de Cenoura"))
                .andExpect(jsonPath("$.ativo").value(true))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].produtoNome").value("Farinha"))
                .andExpect(jsonPath("$.itens[0].quantidade").value(2.5));
    }

    @Test
    void cadastrar_semItens_devolve400() throws Exception {
        cadastrar(empresaA, corpo("Bolo", "[]"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastrar_comQuantidadeZero_devolve400() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "0")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastrar_comCategoriaMaiorQue60Caracteres_devolve400() throws Exception {
        String corpo = corpo("Bolo", itens(farinha, "1")).replace("\"Doce\"", "\"" + "c".repeat(61) + "\"");

        cadastrar(empresaA, corpo)
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastrar_comProdutoRepetido_devolve400() throws Exception {
        cadastrar(empresaA, corpo("Pão", itens(farinha, "1", farinha, "2")))
                .andExpect(status().isBadRequest());
    }

    @Test
    void cadastrar_comProdutoDeOutraEmpresa_devolve404() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(produtoEmpresaB, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrar_comProdutoInativo_devolve404() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(produtoInativo, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrar_comNomeRepetidoEntreAtivas_devolve409() throws Exception {
        cadastrar(empresaA, corpo("Massa de Pizza", itens(farinha, "1"))).andExpect(status().isCreated());

        cadastrar(empresaA, corpo("massa de pizza", itens(acucar, "1")))
                .andExpect(status().isConflict());
    }

    @Test
    void cadastrar_comMesmoNomeEmOutraEmpresa_devolve201() throws Exception {
        cadastrar(empresaA, corpo("Massa de Pizza", itens(farinha, "1"))).andExpect(status().isCreated());

        cadastrar(empresaB, corpo("Massa de Pizza", itens(produtoEmpresaB, "1")))
                .andExpect(status().isCreated());
    }

    @Test
    void desativar_depoisCadastrarMesmoNome_devolve201() throws Exception {
        Integer id = idCriada(empresaA, corpo("Massa", itens(farinha, "1")));

        mockMvc.perform(patch("/api/receitas/{id}/desativar", id).with(logadoEm(empresaA)))
                .andExpect(status().isNoContent());

        cadastrar(empresaA, corpo("Massa", itens(farinha, "1")))
                .andExpect(status().isCreated());
    }

    @Test
    void listar_devolveSoAsReceitasDaEmpresaLogada() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "1"))).andExpect(status().isCreated());
        cadastrar(empresaB, corpo("Torta", itens(produtoEmpresaB, "1"))).andExpect(status().isCreated());

        mockMvc.perform(get("/api/receitas").with(logadoEm(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].nome").value("Bolo"));
    }

    @Test
    void buscarPorId_deOutraEmpresa_devolve404() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));

        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaB)))
                .andExpect(status().isNotFound());
    }

    @Test
    void buscarPorId_daPropriaEmpresa_devolveOsItens() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1", acucar, "2")));
        limparCache();

        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(2)));
    }

    @Test
    void atualizar_mantendoUmProdutoETrocandoOutro_atualizaOsItens() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1", acucar, "2")));
        limparCache();

        // farinha continua com outra quantidade, açúcar sai, e entra um produto novo
        Produto sal = criarProduto("Sal", true, empresaA);
        atualizar(empresaA, id, corpo("Bolo de Fubá", itens(farinha, "5", sal, "0.5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Bolo de Fubá"))
                .andExpect(jsonPath("$.itens", hasSize(2)))
                .andExpect(jsonPath("$.itens[?(@.produtoNome == 'Farinha')].quantidade").value(contains(5)))
                .andExpect(jsonPath("$.itens[?(@.produtoNome == 'Açúcar')]").isEmpty());

        limparCache();
        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(jsonPath("$.itens", hasSize(2)));
    }

    @Test
    void atualizar_comNomeDeOutraReceitaAtiva_devolve409() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "1"))).andExpect(status().isCreated());
        Integer id = idCriada(empresaA, corpo("Torta", itens(farinha, "1")));

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1")))
                .andExpect(status().isConflict());
    }

    @Test
    void atualizar_receitaDesativada_devolve404() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        mockMvc.perform(patch("/api/receitas/{id}/desativar", id).with(logadoEm(empresaA)))
                .andExpect(status().isNoContent());

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void atualizar_receitaDeOutraEmpresa_devolve404() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));

        atualizar(empresaB, id, corpo("Bolo", itens(produtoEmpresaB, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void desativar_receitaDeOutraEmpresa_devolve404() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));

        mockMvc.perform(patch("/api/receitas/{id}/desativar", id).with(logadoEm(empresaB)))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrar_naoAlteraOSaldoDoProduto() throws Exception {
        farinha.setQuantidadeAtual(new BigDecimal("10.000"));
        produtoRepository.save(farinha);

        cadastrar(empresaA, corpo("Bolo", itens(farinha, "3"))).andExpect(status().isCreated());
        limparCache();

        BigDecimal saldo = produtoRepository.findById(farinha.getId()).orElseThrow().getQuantidadeAtual();
        assertEquals(0, new BigDecimal("10").compareTo(saldo));
    }

    // --- apoio ---

    /** Faz as chamadas valerem como um usuário logado na empresa informada. */
    private RequestPostProcessor logadoEm(Empresa empresa) {
        UsuarioAutenticado principal =
                new UsuarioAutenticado(1, "logado@teste.com", empresa.getId(), "Administrador");
        return authentication(UsernamePasswordAuthenticationToken.authenticated(principal, null, List.of()));
    }

    private ResultActions cadastrar(Empresa empresa, String json) throws Exception {
        return mockMvc.perform(post("/api/receitas")
                .with(logadoEm(empresa))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private ResultActions atualizar(Empresa empresa, Integer id, String json) throws Exception {
        return mockMvc.perform(put("/api/receitas/{id}", id)
                .with(logadoEm(empresa))
                .contentType(MediaType.APPLICATION_JSON)
                .content(json));
    }

    private Integer idCriada(Empresa empresa, String json) throws Exception {
        String resposta = cadastrar(empresa, json)
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }

    /** Força o próximo acesso a ler do banco em vez do que já está em memória. */
    private void limparCache() {
        entityManager.flush();
        entityManager.clear();
    }

    private String corpo(String nome, String itensJson) {
        return """
                {
                  "nome": "%s",
                  "descricao": "Receita de teste",
                  "categoria": "Doce",
                  "rendimento": "1 porção",
                  "tempoPreparoMinutos": 45,
                  "itens": %s
                }
                """.formatted(nome, itensJson);
    }

    private String itens(Produto p1, String q1) {
        return "[{\"produtoId\": %d, \"quantidade\": %s}]".formatted(p1.getId(), q1);
    }

    private String itens(Produto p1, String q1, Produto p2, String q2) {
        return "[{\"produtoId\": %d, \"quantidade\": %s}, {\"produtoId\": %d, \"quantidade\": %s}]"
                .formatted(p1.getId(), q1, p2.getId(), q2);
    }

    private Empresa criarEmpresa(String sufixo) {
        int n = SEQUENCIA.incrementAndGet();
        Empresa e = new Empresa();
        e.setRazaoSocial("Empresa Receita " + sufixo + " LTDA");
        e.setCnpj("%08d000%03d".formatted(70000000 + n, 100 + n % 900));
        return empresaRepository.save(e);
    }

    private Produto criarProduto(String nome, boolean ativo, Empresa empresa) {
        Produto p = new Produto();
        p.setNome(nome);
        p.setCodigo("RCT" + SEQUENCIA.incrementAndGet());
        p.setTipo(TipoProduto.insumo);
        p.setUnidadeMedida(unidade);
        p.setAtivo(ativo);
        p.setEmpresa(empresa);
        return produtoRepository.save(p);
    }
}
