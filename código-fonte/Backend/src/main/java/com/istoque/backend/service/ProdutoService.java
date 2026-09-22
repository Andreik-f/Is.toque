package com.istoque.backend.service;

import com.istoque.backend.repository.ProdutoRepository;
import org.springframework.stereotype.Service;
import com.istoque.backend.model.Produto;
import java.util.List;
import java.util.Optional;

@Service
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoService(ProdutoRepository produtoRepository) {
        this.produtoRepository = produtoRepository;
    }

    //método de cadastro
    public Produto salvar(Produto produto) {
        return produtoRepository.save(produto);
    }

    // método de listagem
    public List<Produto> listarTodos() {
        return produtoRepository.findAll();
    }

    // método de buscar produto por id
    public Optional<Produto> buscarPorId(Integer id) {
        return produtoRepository.findById(id);
    }

    //método de atualizar
    public Produto atualizar(Integer id, Produto produto) {
        Produto produtoExistente = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setId(id);
        produto.setCriadoEm(produtoExistente.getCriadoEm());

        return produtoRepository.save(produto);
    }

    // método para desativar (não exclui dados do banco)
    public Produto desativar(Integer id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setAtivo(false);

        return produtoRepository.save(produto);
    }

    public List<Produto> listarAtivos() {
        return produtoRepository.findByAtivoTrue();
    }


}