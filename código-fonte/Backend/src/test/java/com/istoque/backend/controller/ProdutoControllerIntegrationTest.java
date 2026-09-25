package com.istoque.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.istoque.backend.model.Categoria;
import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.UnidadeMedida;
import com.istoque.backend.repository.CategoriaRepository;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.PerfilRepository;
import com.istoque.backend.repository.ProdutoRepository;
import com.istoque.backend.repository.UnidadeMedidaRepository;
import com.istoque.backend.repository.UsuarioRepository;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Cobre o mapeamento de erros do CRUD de produtos (HU005): 404 para produto
 * ou empresa inexistente, 400 com mensagem por campo para validação,
 * referências inválidas (unidade/categoria) e corpo ou parâmetro mal
 * formatado, e 405/404 para método ou rota inexistente — nenhum desses casos
 * pode cair no 500 genérico.
 */
@SpringBootTest
@AutoConfigureMockMvc
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
    private UnidadeMedida quilo;
    private Categoria categoriaEmpresaA;
    private Categoria categoriaEmpresaB;

    @BeforeEach
    void setUp() {
        limparBanco();

        empresaA = new Empresa();
        empresaA.setRazaoSocial("Empresa A LTDA");
        empresaA.setCnpj("11111111000101");
        empresaA = empresaRepository.save(empresaA);

        Empresa empresaB = new Empresa();
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

    @Test
    void criarProduto_comNomeMaiorQue120Caracteres_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("nome", "a".repeat(121));

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.nome").value("O nome deve ter no máximo 120 caracteres"));
    }

    @Test
    void criarProduto_comQuantidadeNegativa_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("quantidadeAtual", -1);

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.quantidadeAtual").value("A quantidade atual não pode ser negativa"));
    }

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

    @Test
    void criarProduto_comTipoInvalido_devolve400ComValoresAceitos() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("tipo", "xyz");

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos.tipo").value("Valor inválido. Valores aceitos: insumo, revenda, ambos"));
    }

    @Test
    void criarProduto_comJsonMalFormatado_devolve400() throws Exception {
        mockMvc.perform(post("/api/produtos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nome\": "))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("O corpo da requisição está ausente ou mal formatado"));
    }

    @Test
    void criarProduto_comEmpresaInexistente_devolve404() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("empresaId", 999999);
        corpo.remove("categoriaId");

        criarProduto(corpo)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Empresa não encontrada com o id: 999999"));
    }

    @Test
    void criarProduto_comUnidadeMedidaInexistente_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("unidadeMedidaId", 999999);

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Unidade de medida não encontrada com o id: 999999"));
    }

    @Test
    void criarProduto_comCategoriaDeOutraEmpresa_devolve400() throws Exception {
        Map<String, Object> corpo = corpoValido();
        corpo.put("categoriaId", categoriaEmpresaB.getId());

        criarProduto(corpo)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Categoria não encontrada com o id: " + categoriaEmpresaB.getId()));
    }

    @Test
    void buscarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(get("/api/produtos/{id}", 999999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Produto não encontrado com o id: 999999"));
    }

    @Test
    void buscarProduto_comIdNaoNumerico_devolve400() throws Exception {
        mockMvc.perform(get("/api/produtos/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Valor inválido para o parâmetro 'id': abc"));
    }

    @Test
    void atualizarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(put("/api/produtos/{id}", 999999)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(corpoValido())))
                .andExpect(status().isNotFound());
    }

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

    @Test
    void desativarProduto_existente_devolve200ComAtivoFalse() throws Exception {
        Integer id = criarProdutoValido();

        mockMvc.perform(patch("/api/produtos/{id}/desativar", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ativo").value(false));
    }

    @Test
    void desativarProduto_inexistente_devolve404() throws Exception {
        mockMvc.perform(patch("/api/produtos/{id}/desativar", 999999))
                .andExpect(status().isNotFound());
    }

    @Test
    void metodoNaoSuportado_devolve405() throws Exception {
        mockMvc.perform(delete("/api/produtos/{id}", 1))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.message").value("Método DELETE não é suportado para esta rota"));
    }

    @Test
    void rotaInexistente_devolve404() throws Exception {
        mockMvc.perform(get("/api/produto"))
                .andExpect(status().isNotFound());
    }

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

    private ResultActions criarProduto(Map<String, Object> corpo) throws Exception {
        return mockMvc.perform(post("/api/produtos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(corpo)));
    }

    private Integer criarProdutoValido() throws Exception {
        String resposta = criarProduto(corpoValido())
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(resposta, "$.id");
    }

    private Categoria criarCategoria(String nome, Empresa empresa) {
        Categoria categoria = new Categoria();
        categoria.setNome(nome);
        categoria.setEmpresa(empresa);
        return categoriaRepository.save(categoria);
    }

    private void limparBanco() {
        produtoRepository.deleteAll();
        categoriaRepository.deleteAll();
        unidadeMedidaRepository.deleteAll();
        usuarioRepository.deleteAll();
        perfilRepository.deleteAll();
        empresaRepository.deleteAll();
    }
}
