package br.com.istoque.exception;

public class CnpjJaCadastradoException extends RuntimeException {

    public CnpjJaCadastradoException(String cnpj) {
        super("Já existe uma empresa cadastrada com o CNPJ: " + cnpj);
    }

}
