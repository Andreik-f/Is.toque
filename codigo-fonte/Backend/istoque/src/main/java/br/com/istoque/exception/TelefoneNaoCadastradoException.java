package br.com.istoque.exception;

public class TelefoneNaoCadastradoException extends RuntimeException {

    public TelefoneNaoCadastradoException() {
        super("Cadastre o telefone da empresa antes de pedir o código");
    }
}
