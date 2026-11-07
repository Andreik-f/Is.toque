package br.com.istoque.controller;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Produto;
import br.com.istoque.infrastructure.entity.TipoProduto;
import br.com.istoque.support.UsuarioDeTeste;
import br.com.istoque.infrastructure.entity.UnidadeMedida;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.contains;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.hamcrest.Matchers.hasSize;
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
    private UnidadeMedida unidadeInteira;
    private Produto ovo;
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

        unidadeInteira = new UnidadeMedida();
        unidadeInteira.setSigla("unR");
        unidadeInteira.setNome("Unidade de receita");
        unidadeInteira.setFracionavel(false);
        unidadeInteira = unidadeMedidaRepository.save(unidadeInteira);

        ovo = criarProduto("Ovo", true, empresaA, unidadeInteira);
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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.itens").exists());
    }

    @Test
    void cadastrar_comQuantidadeZero_devolve400() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
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
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.itens").exists());
    }

    @Test
    void cadastrar_comProdutoDeOutraEmpresa_devolve404() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(produtoEmpresaB, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void cadastrar_comProdutoInativo_devolve422() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(produtoInativo, "1")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.message")
                        .value("O produto 'Fermento' está inativo e não pode fazer parte da receita."));
    }

    /** O 404 vem antes do 422: o 422 diria à empresa A que o id existe na empresa B. */
    @Test
    void cadastrar_comProdutoInativoDeOutraEmpresa_devolve404() throws Exception {
        Produto inativoDaB = criarProduto("Fermento da B", false, empresaB);

        cadastrar(empresaA, corpo("Bolo", itens(inativoDaB, "1")))
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

    /** Desativar o produto preserva o histórico: a receita que o usa continua mostrando o item. */
    @Test
    void buscarPorId_comProdutoDesativado_continuaMostrandoOItem() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        farinha.setAtivo(false);
        produtoRepository.saveAndFlush(farinha);
        limparCache();

        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].produtoId").value(farinha.getId()));
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

    // --- produto inexistente e validações no PUT ---

    @Test
    void cadastrar_comProdutoInexistente_devolve404() throws Exception {
        String itens = "[{\"produtoId\": 999999, \"quantidade\": 1}]";

        cadastrar(empresaA, corpo("Bolo", itens))
                .andExpect(status().isNotFound());
    }

    @Test
    void atualizar_semItens_devolve400() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", "[]"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.itens").exists());
    }

    @Test
    void atualizar_comQuantidadeZero_devolve400() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "0")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
    }

    @Test
    void atualizar_comProdutoRepetido_devolve400() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1", farinha, "2")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.itens").exists());
    }

    @Test
    void atualizar_comProdutoDeOutraEmpresa_devolve404() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(produtoEmpresaB, "1")))
                .andExpect(status().isNotFound());
    }

    @Test
    void atualizar_comProdutoInativo_devolve422() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(produtoInativo, "1")))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.message").exists());
    }

    /** Receita com produto desativado depois só é editada sem esse item. */
    @Test
    void atualizar_mantendoItemDeProdutoDesativadoDepois_devolve422() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        farinha.setAtivo(false);
        produtoRepository.saveAndFlush(farinha);
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "2")))
                .andExpect(status().isUnprocessableContent());
    }

    // --- unidade de medida e casas decimais ---

    @Test
    void cadastrar_comFracaoEmUnidadeInteira_devolve400ComOCampo() throws Exception {
        cadastrar(empresaA, corpo("Omelete", itens(ovo, "2.5")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
    }

    @Test
    void cadastrar_comFracaoEmUnidadeInteiraNaSegundaPosicao_apontaOIndiceCerto() throws Exception {
        cadastrar(empresaA, corpo("Omelete", itens(farinha, "1", ovo, "1.5")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[1].quantidade']").exists());
    }

    @Test
    void cadastrar_comQuantidadeInteiraEmUnidadeInteira_devolve201() throws Exception {
        cadastrar(empresaA, corpo("Omelete", itens(ovo, "3")))
                .andExpect(status().isCreated());
    }

    @Test
    void cadastrar_comZerosAposAVirgulaEmUnidadeInteira_devolve201() throws Exception {
        cadastrar(empresaA, corpo("Omelete", itens(ovo, "3.000")))
                .andExpect(status().isCreated());
    }

    @Test
    void cadastrar_comFracaoEmUnidadeFracionavel_devolve201() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "0.125")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.itens[0].quantidade").value(0.125));
    }

    @Test
    void atualizar_comFracaoEmUnidadeInteira_devolve400ComOCampo() throws Exception {
        Integer id = idCriada(empresaA, corpo("Omelete", itens(ovo, "2")));
        limparCache();

        atualizar(empresaA, id, corpo("Omelete", itens(ovo, "2.5")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
    }

    @Test
    void atualizar_comFracaoEmUnidadeFracionavel_devolve200() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1.5")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens[0].quantidade").value(1.5));
    }

    @Test
    void cadastrar_comMaisDeTresCasasDecimais_devolve400ComOCampo() throws Exception {
        cadastrar(empresaA, corpo("Bolo", itens(farinha, "1.2345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
    }

    @Test
    void atualizar_comMaisDeTresCasasDecimais_devolve400ComOCampo() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1.2345")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos['itens[0].quantidade']").exists());
    }

    // --- edição dos itens, um caso por vez ---

    @Test
    void atualizar_soRemovendoUmItem_mantemOsOutros() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1", acucar, "2")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].produtoNome").value("Farinha"));

        limparCache();
        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(jsonPath("$.itens", hasSize(1)))
                .andExpect(jsonPath("$.itens[0].produtoNome").value("Farinha"));
    }

    @Test
    void atualizar_soAlterandoQuantidade_mantemOsMesmosItens() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1", acucar, "2")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "4", acucar, "2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(2)));

        limparCache();
        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(jsonPath("$.itens", hasSize(2)))
                .andExpect(jsonPath("$.itens[?(@.produtoNome == 'Farinha')].quantidade").value(contains(4.0)))
                .andExpect(jsonPath("$.itens[?(@.produtoNome == 'Açúcar')].quantidade").value(contains(2.0)));
    }

    @Test
    void atualizar_soIncluindoUmItem_mantemOsExistentes() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", itens(farinha, "1", acucar, "2")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.itens", hasSize(2)));

        limparCache();
        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(jsonPath("$.itens", hasSize(2)));
    }

    @Test
    void atualizar_removendoTodosOsItens_devolve400ESemPerderOsItens() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1", acucar, "2")));
        limparCache();

        atualizar(empresaA, id, corpo("Bolo", "[]"))
                .andExpect(status().isBadRequest());

        limparCache();
        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(jsonPath("$.itens", hasSize(2)));
    }

    // --- receita desativada ---

    @Test
    void buscarPorId_deReceitaDesativada_devolve200ComAtivoFalso() throws Exception {
        Integer id = idCriada(empresaA, corpo("Bolo", itens(farinha, "1")));
        mockMvc.perform(patch("/api/receitas/{id}/desativar", id).with(logadoEm(empresaA)))
                .andExpect(status().isNoContent());
        limparCache();

        mockMvc.perform(get("/api/receitas/{id}", id).with(logadoEm(empresaA)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false))
                .andExpect(jsonPath("$.itens", hasSize(1)));
    }

    // --- saldo na edição ---

    /**
     * Compara o saldo de todos os produtos antes e depois de cadastrar e de editar.
     * Lote e movimentação ainda não têm entidade nem tabela no banco dos testes (H2 sem
     * migrações), então o que dá para conferir aqui é a quantidade atual do produto.
     */
    @Test
    void cadastrarEEditar_naoAlteramOSaldoDeNenhumProduto() throws Exception {
        farinha.setQuantidadeAtual(new BigDecimal("10.000"));
        acucar.setQuantidadeAtual(new BigDecimal("4.500"));
        ovo.setQuantidadeAtual(new BigDecimal("12.000"));
        produtoEmpresaB.setQuantidadeAtual(new BigDecimal("7.000"));
        produtoRepository.saveAll(List.of(farinha, acucar, ovo, produtoEmpresaB));
        limparCache();
        Map<Integer, BigDecimal> antes = saldos();

        Integer id = idCriada(empresaA, corpo("Omelete", itens(farinha, "3", ovo, "2")));
        limparCache();
        assertEquals(antes, saldos(), "saldo mudou depois do cadastro");

        atualizar(empresaA, id, corpo("Omelete", itens(acucar, "1.5", ovo, "6")))
                .andExpect(status().isOk());
        limparCache();
        assertEquals(antes, saldos(), "saldo mudou depois da edição");
    }

    // --- apoio ---

    private Map<Integer, BigDecimal> saldos() {
        Map<Integer, BigDecimal> saldos = new HashMap<>();
        for (Produto p : produtoRepository.findAll()) {
            saldos.put(p.getId(), p.getQuantidadeAtual().setScale(3));
        }
        return saldos;
    }

    /** Faz as chamadas valerem como um usuário logado na empresa informada. */
    private RequestPostProcessor logadoEm(Empresa empresa) {
        return UsuarioDeTeste.autenticadoComo(1, empresa.getId(), "Administrador");
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
        return criarProduto(nome, ativo, empresa, unidade);
    }

    private Produto criarProduto(String nome, boolean ativo, Empresa empresa, UnidadeMedida unidadeDoProduto) {
        Produto p = new Produto();
        p.setNome(nome);
        p.setCodigo("RCT" + SEQUENCIA.incrementAndGet());
        p.setTipo(TipoProduto.insumo);
        p.setUnidadeMedida(unidadeDoProduto);
        p.setAtivo(ativo);
        p.setEmpresa(empresa);
        return produtoRepository.save(p);
    }
}
