package br.com.istoque.exception;

public class PermissaoObrigatoriaDoAdministradorException extends RuntimeException {

    public PermissaoObrigatoriaDoAdministradorException(String mensagem) {
        super(mensagem);
    }
}
