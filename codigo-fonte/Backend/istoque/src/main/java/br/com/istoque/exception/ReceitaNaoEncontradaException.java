package br.com.istoque.exception;

public class ReceitaNaoEncontradaException extends RuntimeException {

    public ReceitaNaoEncontradaException(Integer id) {
        super("Receita não encontrada com o id: " + id);
    }

}
