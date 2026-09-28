package br.com.istoque.exception;

public class ProdutoNaoEncontradoException extends RuntimeException {

    public ProdutoNaoEncontradoException(Integer id) {
        super("Produto não encontrado com o id: " + id);
    }

}
