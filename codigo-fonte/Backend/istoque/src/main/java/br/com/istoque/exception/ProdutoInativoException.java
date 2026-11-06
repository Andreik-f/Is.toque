package br.com.istoque.exception;

public class ProdutoInativoException extends RuntimeException {

    public ProdutoInativoException(String nomeProduto) {
        super("O produto '" + nomeProduto + "' está inativo e não pode fazer parte da receita.");
    }

}
