package br.com.istoque.exception;

public class CodigoInvalidoException extends RuntimeException {

    public CodigoInvalidoException() {
        super("Código inválido ou vencido");
    }
}
