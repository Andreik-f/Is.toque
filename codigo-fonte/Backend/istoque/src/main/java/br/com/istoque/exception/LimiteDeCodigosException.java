package br.com.istoque.exception;

public class LimiteDeCodigosException extends RuntimeException {

    public LimiteDeCodigosException() {
        super("Muitos pedidos de código. Aguarde para pedir um novo");
    }
}
