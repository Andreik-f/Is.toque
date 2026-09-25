package com.istoque.backend.service;

import com.istoque.backend.dto.ProdutoRequestDTO;
import com.istoque.backend.dto.ProdutoResponseDTO;
import com.istoque.backend.exception.CategoriaNaoEncontradaException;
import com.istoque.backend.exception.EmpresaNaoEncontradaException;
import com.istoque.backend.exception.ProdutoNaoEncontradoException;
import com.istoque.backend.exception.UnidadeMedidaNaoEncontradaException;
import com.istoque.backend.model.Categoria;
import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.Produto;
import com.istoque.backend.model.UnidadeMedida;
import com.istoque.backend.repository.CategoriaRepository;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.ProdutoRepository;
import com.istoque.backend.repository.UnidadeMedidaRepository;
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
        return ProdutoResponseDTO.fromEntity(produtoRepository.save(produto));
    }

    // método de listagem
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarTodos() {
        return produtoRepository.findAll().stream()
                .map(ProdutoResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarAtivos() {
        return produtoRepository.findByAtivoTrue().stream()
                .map(ProdutoResponseDTO::fromEntity)
                .toList();
    }

    // método de buscar produto por id
    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(Integer id) {
        return ProdutoResponseDTO.fromEntity(buscarProduto(id));
    }

    //método de atualizar
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

    // valida as referências (empresa, unidade e categoria) e copia os dados do DTO para a entidade
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
        produto.setQuantidadeAtual(dto.quantidadeAtual() != null ? dto.quantidadeAtual() : BigDecimal.ZERO);
        produto.setEstoqueMinimo(dto.estoqueMinimo() != null ? dto.estoqueMinimo() : BigDecimal.ZERO);
        produto.setEstoqueMaximo(dto.estoqueMaximo());
        produto.setControlaValidade(Boolean.TRUE.equals(dto.controlaValidade()));
    }
}
