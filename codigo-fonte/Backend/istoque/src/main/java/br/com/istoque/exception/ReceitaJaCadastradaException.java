package br.com.istoque.exception;

public class ReceitaJaCadastradaException extends RuntimeException {

    public ReceitaJaCadastradaException(String nome) {
        super("Já existe uma receita ativa com o nome: " + nome);
    }

}
