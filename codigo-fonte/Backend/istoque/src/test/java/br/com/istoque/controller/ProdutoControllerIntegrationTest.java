package br.com.istoque.controller;

import br.com.istoque.support.WithUsuarioAutenticado;
import tools.jackson.databind.ObjectMapper;
import br.com.istoque.infrastructure.entity.Categoria;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.UnidadeMedida;
import br.com.istoque.infrastructure.repository.CategoriaRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração do CRUD de produtos (/api/produtos).
 *
 * Cobre o mapeamento de erros do CRUD de produtos (HU005): 404 para produto
 * ou empresa inexistente, 400 com mensagem por campo para validação,
 * referências inválidas (unidade/categoria) e corpo ou parâmetro mal
 * formatado, e 405/404 para método ou rota inexistente — nenhum desses casos
 * pode cair no 500 genérico. Também garante que editar um produto não muda o
 * saldo do estoque (HT014) e que a listagem filtra pela empresa (HT028).
 *
 * Roda com banco H2 em memória e MockMvc, como os demais testes de controller.
 */
@SpringBootTest
@AutoConfigureMockMvc
@WithUsuarioAutenticado
class ProdutoControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProdutoRepository produtoRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private UnidadeMedidaRepository unidadeMedidaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PerfilRepository perfilRepository;

    @Autowired
    private EmpresaRepository empresaRepository;

    private Empresa empresaA;
    private Empresa empresaB;
    private UnidadeMedida quilo;
    private Categoria categoriaEmpresaA;
    private Categoria categoriaEmpresaB;

    /**
     * Antes de cada teste, limpa o banco e monta o cenário base: as empresas A
     * e B, a unidade de medida kg e uma categoria para cada empresa
     * (Laticínios na A, Bebidas na B).
     */
    @BeforeEach
    void setUp() {
        limparBanco();

        empresaA = new Empresa();
        empresaA.setRazaoSocial("Empresa A LTDA");
        empresaA.setCnpj("11111111000101");
        empresaA = empresaRepository.save(empresaA);

        empresaB = new Empresa();
        empresaB.setRazaoSocial("Empresa B LTDA");
        empresaB.setCnpj("22222222000102");
        empresaB = empresaRepository.save(empresaB);

        quilo = new UnidadeMedida();
        quilo.setSigla("kg");
        quilo.setNome("Quilograma");
        quilo = unidadeMedidaRepository.save(quilo);

        categoriaEmpresaA = criarCategoria("Laticínios", empresaA);
        categoriaEmpresaB = criarCategoria("Bebidas", empresaB);
    }

    // os outros testes apagam empresas; produto e categoria não podem sobrar apontando para elas
    @AfterEach
    void tearDown() {
        limparBanco();
    }

    /**
     * Caminho feliz: produto válido devolve 201 com Location. A resposta traz
     * o nome da categoria e a sigla da unidade (não só os ids) e o produto já
     * nasce ativo.
     */
    @Test
    void criarProduto_comDadosValidos_devolve201ComLocation() throws Exception {
        criarProduto(corpoValido())
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.nome").value("Queijo minas"))
                .andExpect(jsonPath("$.tipo").value("insumo"))
                .andExpect(jsonPath("$.categoria").value("Laticínios"))
                .andExpect(jsonPath("$.unidadeMedida").value("kg"))
                .andExpect(jsonPath("$.ativo").value(true));
    }

    /**
     * Corpo vazio devolve 400 com "Dados inválidos" e uma mensagem para cada
     * campo obrigatório, para o front-end mostrar o erro ao lado do campo certo.
     */
    @Test
    void criarProduto_comCamposObrigatoriosAusentes_devolve400ComMensagemPorCampo() throws Exception {
        criarProduto(Map.of())
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dados inválidos"))
                .andExpect(jsonPath("$.campos.nome").value("O nome é obrigatório"))
                .andExpect(jsonPath("$.campos.tipo").value("O tipo é obrigatório"))
                .andExpect(jsonPath("$.campos.empresaId").value("A empresa é obrigatória"))
                .andExpect(jsonPath("$.campos.unidadeMedidaId").value("A unidade de medida é obrigatória"));
    }

    /** Testa o limite exato do nome: 121 caracteres, um acima do máximo, devolve 400. */
    @Test
    void criarProduto_comNomeMaiorQue120Caracteres_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("nome", "a".repeat(121));

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("O nome deve ter no máximo 120 caracteres"));
    }

    /** Quantidade atual negativa devolve 400: estoque não pode ficar abaixo de zero. */
    @Test
    void criarProduto_comQuantidadeNegativa_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("quantidadeAtual", -1);

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.quantidadeAtual").value("A quantidade atual não pode ser negativa"));
    }

    /**
     * Estoque máximo menor que o mínimo devolve 400. Como essa regra compara
     * dois campos, ela é um método @AssertTrue no ProdutoRequestDTO, e por isso
     * o erro aparece com o nome estoqueMaximoValido, e não com o de um campo
     * do JSON.
     */
    @Test
    void criarProduto_comEstoqueMaximoMenorQueMinimo_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("estoqueMinimo", 10);
        corpo.put("estoqueMaximo", 5);

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.estoqueMaximoValido")
                        .value("O estoque máximo não pode ser menor que o estoque mínimo"));
    }

    /**
     * Tipo fora da lista devolve 400 dizendo quais valores são aceitos
     * (insumo, revenda, ambos), em vez de um erro genérico de JSON.
     */
    @Test
    void criarProduto_comTipoInvalido_devolve400ComValoresAceitos() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("tipo", "xyz");

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.tipo").value("Valor inválido. Valores aceitos: insumo, revenda, ambos"));
    }

    /** JSON quebrado devolve 400 com uma mensagem clara, e não 500. */
    @Test
    void criarProduto_comJsonMalFormatado_devolve400() throws Exception {
        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("O corpo da requisição está ausente ou mal formatado"));
    }

    /**
     * empresaId que não existe devolve 404. A categoria sai do corpo para
     * isolar o erro: o teste confere só a empresa inexistente.
     */
    @Test
    void criarProduto_comEmpresaInexistente_devolve404() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("empresaId", 999999);
        corpo.remove("categoriaId");

        criarProduto(corpo)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Empresa não encontrada com o id: 999999"));
    }

    /** unidadeMedidaId que não existe devolve 400 com mensagem. */
    @Test
    void criarProduto_comUnidadeMedidaInexistente_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("unidadeMedidaId", 999999);

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unidade de medida não encontrada com o id: 999999"));
    }

    /**
     * Categoria da empresa B num produto da empresa A devolve 400, como se a
     * categoria não existisse: cada empresa só enxerga as próprias categorias.
     */
    @Test
    void criarProduto_comCategoriaDeOutraEmpresa_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("categoriaId", categoriaEmpresaB.getId());

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Categoria não encontrada com o id: " + categoriaEmpresaB.getId()));
    }

    /** Buscar um id que não existe devolve 404 com mensagem. */
    @Test
    void buscarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(get("/api/produtos/{id}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Produto não encontrado com o id: 999999"));
    }

    /** Id que não é número (/api/produtos/abc) devolve 400 dizendo qual parâmetro está errado. */
    @Test
    void buscarProduto_comIdNaoNumerico_devolve400() throws Exception {
        mockMvc.perform(get("/api/produtos/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Valor inválido para o parâmetro 'id': abc"));
    }

    /** Atualizar um id que não existe devolve 404. */
    @Test
    void atualizarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(put("/api/produtos/{id}", 999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpoValido())))
                .andExpect(status().isNotFound());
    }

    /**
     * Editar um produto desativado não pode reativá-lo por acidente: depois do
     * PUT o nome muda, mas o produto continua com ativo = false.
     */
    @Test
    void atualizarProduto_desativado_mantemAtivoFalse() throws Exception {
        Integer id = criarProdutoValido();
        mockMvc.perform(patch("/api/produtos/{id}/desativar", id))
                .andExpect(status().isOk());

        Map<String, Object> corpo = corpoValido();
        corpo.put("nome", "Queijo minas frescal");

        mockMvc.perform(put("/api/produtos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Queijo minas frescal"))
                .andExpect(jsonPath("$.ativo").value(false));
    }

    /**
     * O saldo só muda por movimentação (RE-05): um PUT com outra quantidadeAtual
     * altera o nome, mas o estoque continua o do cadastro.
     */
    @Test
    void atualizarProduto_comOutraQuantidade_naoAlteraOSaldo() throws Exception {
        Integer id = criarProdutoValido();

        Map<String, Object> corpo = corpoValido();
        corpo.put("nome", "Queijo minas padrão");
        corpo.put("quantidadeAtual", 50);

        mockMvc.perform(put("/api/produtos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpo)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value("Queijo minas padrão"));

        assertSaldo(id, "5");
    }

    /**
     * Editar sem enviar quantidadeAtual não pode zerar o estoque: o saldo
     * continua o do cadastro.
     */
    @Test
    void atualizarProduto_semQuantidade_mantemOSaldo() throws Exception {
        Integer id = criarProdutoValido();

        Map<String, Object> corpo = corpoValido();
        corpo.remove("quantidadeAtual");

        mockMvc.perform(put("/api/produtos/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpo)))
                .andExpect(status().isOk());

        assertSaldo(id, "5");
    }

    /** Desativar devolve 200 com ativo = false: o produto não é apagado, só desativado. */
    @Test
    void desativarProduto_existente_devolve200ComAtivoFalse() throws Exception {
        Integer id = criarProdutoValido();

        mockMvc.perform(patch("/api/produtos/{id}/desativar", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }

    /** Desativar um id que não existe devolve 404. */
    @Test
    void desativarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(patch("/api/produtos/{id}/desativar", 999999))
                .andExpect(status().isNotFound());
    }

    /**
     * Com ?empresaId=, a listagem traz só os produtos da empresa, em ordem de
     * nome (HT028): é assim que o estoque do front carrega os produtos.
     */
    @Test
    void listarProdutos_comEmpresaId_devolveSoOsDaEmpresaEmOrdemDeNome() throws Exception {
        criarProdutosDasDuasEmpresas();

        mockMvc.perform(get("/api/produtos").param("empresaId", empresaA.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].nome").value("Manteiga"))
                .andExpect(jsonPath("$[1].nome").value("Queijo minas"));
    }

    /** Sem ?empresaId=, a listagem continua trazendo os produtos de todas as empresas. */
    @Test
    void listarProdutos_semEmpresaId_devolveTodos() throws Exception {
        criarProdutosDasDuasEmpresas();

        mockMvc.perform(get("/api/produtos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3));
    }

    /** A listagem de ativos com ?empresaId= não traz os desativados nem os de outra empresa. */
    @Test
    void listarAtivos_comEmpresaId_naoTrazDesativadosNemDeOutraEmpresa() throws Exception {
        criarProdutosDasDuasEmpresas();
        Integer desativado = criarProdutoValido();
        mockMvc.perform(patch("/api/produtos/{id}/desativar", desativado))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/produtos/ativos").param("empresaId", empresaA.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[*].id", not(hasItem(desativado))));
    }

    /**
     * Não existe DELETE para produtos (eles são desativados, não apagados):
     * a chamada devolve 405 com mensagem, e não 500.
     */
    @Test
    void metodoNaoSuportado_devolve405() throws Exception {
        mockMvc.perform(delete("/api/produtos/{id}", 1))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.message").value("Método DELETE não é suportado para esta rota"));
    }

    /** Rota que não existe (/api/produto, no singular) devolve 404, e não 500. */
    @Test
    void rotaInexistente_devolve404() throws Exception {
        mockMvc.perform(get("/api/produto"))
                .andExpect(status().isNotFound());
    }

    /**
     * Corpo de um produto válido da empresa A. Os testes de erro partem dele e
     * mudam só o campo que querem testar.
     */
    private Map<String, Object> corpoValido() {
        Map<String, Object> corpo = new LinkedHashMap<>();
        corpo.put("empresaId", empresaA.getId());
        corpo.put("categoriaId", categoriaEmpresaA.getId());
        corpo.put("unidadeMedidaId", quilo.getId());
        corpo.put("codigo", "QJ-001");
        corpo.put("nome", "Queijo minas");
        corpo.put("tipo", "insumo");
        corpo.put("quantidadeAtual", 5);
        corpo.put("estoqueMinimo", 2);
        corpo.put("estoqueMaximo", 20);
        corpo.put("controlaValidade", true);
        return corpo;
    }

    /** Chama POST /api/produtos com o corpo informado. */
    private ResultActions criarProduto(Map<String, Object> corpo) throws Exception {
        return mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(corpo)));
    }

    /** Cria um produto válido pela API e devolve o id dele. */
    private Integer criarProdutoValido() throws Exception {
        String resposta = criarProduto(corpoValido())
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }

    /**
     * Cria dois produtos da empresa A (Queijo minas e Manteiga, fora da ordem
     * alfabética) e um da empresa B.
     */
    private void criarProdutosDasDuasEmpresas() throws Exception {
        criarProdutoValido();

        Map<String, Object> manteiga = corpoValido();
        manteiga.put("nome", "Manteiga");
        criarProduto(manteiga).andExpect(status().isCreated());

        Map<String, Object> daEmpresaB = corpoValido();
        daEmpresaB.put("empresaId", empresaB.getId());
        daEmpresaB.put("categoriaId", categoriaEmpresaB.getId());
        daEmpresaB.put("nome", "Água mineral");
        criarProduto(daEmpresaB).andExpect(status().isCreated());
    }

    /** Confere no banco o saldo do produto (compareTo ignora a escala: 5 = 5.000). */
    private void assertSaldo(Integer id, String esperado) {
        BigDecimal saldo = produtoRepository.findById(id).orElseThrow().getQuantidadeAtual();
        assertEquals(0, new BigDecimal(esperado).compareTo(saldo),
                "Saldo esperado " + esperado + ", mas está " + saldo);
    }

    /** Grava uma categoria da empresa informada. */
    private Categoria criarCategoria(String nome, Empresa empresa) {
        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setEmpresa(empresa);
        return categoriaRepository.save(categoria);
    }

    /**
     * Apaga tudo na ordem das chaves estrangeiras: primeiro o que aponta para
     * a empresa (produto, categoria, usuário, perfil), por último a empresa.
     */
    private void limparBanco() {
        produtoRepository.deleteAll();
        categoriaRepository.deleteAll();
        unidadeMedidaRepository.deleteAll();
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
    }
}
