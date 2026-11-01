package br.com.istoque.exception;

public class PermissaoInvalidaException extends RuntimeException {

    public PermissaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
