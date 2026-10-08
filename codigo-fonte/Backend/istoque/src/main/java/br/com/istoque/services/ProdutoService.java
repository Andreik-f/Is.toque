package br.com.istoque.services;

import br.com.istoque.dto.ProdutoRequestDTO;
import br.com.istoque.dto.ProdutoResponseDTO;
import br.com.istoque.exception.CategoriaNaoEncontradaException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.exception.ProdutoNaoEncontradoException;
import br.com.istoque.exception.UnidadeMedidaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Categoria;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Produto;
import br.com.istoque.infrastructure.entity.UnidadeMedida;
import br.com.istoque.infrastructure.repository.CategoriaRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final EmpresaRepository empresaRepository;
    private final CategoriaRepository categoriaRepository;
    private final UnidadeMedidaRepository unidadeMedidaRepository;

    public ProdutoService(ProdutoRepository produtoRepository,
                          EmpresaRepository empresaRepository,
                          CategoriaRepository categoriaRepository,
                          UnidadeMedidaRepository unidadeMedidaRepository) {
        this.produtoRepository = produtoRepository;
        this.empresaRepository = empresaRepository;
        this.categoriaRepository = categoriaRepository;
        this.unidadeMedidaRepository = unidadeMedidaRepository;
    }

    //método de cadastro
    public ProdutoResponseDTO salvar(ProdutoRequestDTO dto) {
        Produto produto = new Produto();
        preencherDados(produto, dto);
        // o saldo inicial só pode ser informado no cadastro; depois disso ele só
        // muda por movimentação, para que o histórico explique o estoque (RE-05)
        produto.setQuantidadeAtual(dto.quantidadeAtual() != null ? dto.quantidadeAtual() : BigDecimal.ZERO);
        return ProdutoResponseDTO.fromEntity(produtoRepository.save(produto));
    }

    // método de listagem: com a empresa, só os produtos dela, em ordem de nome
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarTodos(Integer empresaId) {
        List<Produto> produtos = empresaId == null
                ? produtoRepository.findAll()
                : produtoRepository.findByEmpresaIdOrderByNome(empresaId);
        return produtos.stream()
                .map(ProdutoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarAtivos(Integer empresaId) {
        List<Produto> produtos = empresaId == null
                ? produtoRepository.findByAtivoTrue()
                : produtoRepository.findByEmpresaIdAndAtivoTrueOrderByNome(empresaId);
        return produtos.stream()
                .map(ProdutoResponseDTO::fromEntity)
                .toList();
    }

    // método de buscar produto por id
    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(Integer id) {
        return ProdutoResponseDTO.fromEntity(buscarProduto(id));
    }

    // método de atualizar: a quantidadeAtual enviada é ignorada, o saldo continua o mesmo
    public ProdutoResponseDTO atualizar(Integer id, ProdutoRequestDTO dto) {
        Produto produto = buscarProduto(id);
        preencherDados(produto, dto);
        return ProdutoResponseDTO.fromEntity(produtoRepository.saveAndFlush(produto));
    }

    // método para desativar (não exclui dados do banco)
    public ProdutoResponseDTO desativar(Integer id) {
        Produto produto = buscarProduto(id);
        produto.setAtivo(false);
        return ProdutoResponseDTO.fromEntity(produtoRepository.saveAndFlush(produto));
    }

    private Produto buscarProduto(Integer id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ProdutoNaoEncontradoException(id));
    }

    // valida as referências (empresa, unidade e categoria) e copia os dados do DTO para a entidade,
    // menos o saldo, que só é definido no cadastro
    private void preencherDados(Produto produto, ProdutoRequestDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.empresaId())
                .orElseThrow(() -> new EmpresaNaoEncontradaException(dto.empresaId()));

        UnidadeMedida unidadeMedida = unidadeMedidaRepository.findById(dto.unidadeMedidaId())
                .orElseThrow(() -> new UnidadeMedidaNaoEncontradaException(dto.unidadeMedidaId()));

        Categoria categoria = null;
        if (dto.categoriaId() != null) {
            categoria = categoriaRepository.findByIdAndEmpresaId(dto.categoriaId(), empresa.getId())
                    .orElseThrow(() -> new CategoriaNaoEncontradaException(dto.categoriaId()));
        }

        produto.setEmpresa(empresa);
        produto.setUnidadeMedida(unidadeMedida);
        produto.setCategoria(categoria);
        produto.setCodigo(dto.codigo());
        produto.setNome(dto.nome());
        produto.setDescricao(dto.descricao());
        produto.setTipo(dto.tipo());
        produto.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : BigDecimal.ZERO);
        produto.setEstoqueMaximo(dto.estoqueMaximo());
        produto.setControlaValidade(Boolean.TRUE.equals(dto.controlaValidade()));
    }
}
