package br.com.istoque.exception;

public class ContaBloqueadaException extends RuntimeException {

    public ContaBloqueadaException() {
        super("Muitas tentativas. Tente novamente mais tarde.");
    }
}
