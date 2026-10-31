package br.com.istoque.exception;

public class ProdutoRepetidoNaReceitaException extends RuntimeException {

    public ProdutoRepetidoNaReceitaException(Integer produtoId) {
        super("A receita não pode conter o mesmo produto mais de uma vez (produto " + produtoId + ")");
    }

}
