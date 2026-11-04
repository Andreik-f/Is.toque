package br.com.istoque.exception;

public class TelefoneNaoCelularException extends RuntimeException {

    public TelefoneNaoCelularException() {
        super("Informe um celular para receber o código");
    }
}
