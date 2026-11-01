package br.com.istoque.exception;

public class PerfilNaoEncontradoNaEmpresaException extends RuntimeException {

    public PerfilNaoEncontradoNaEmpresaException(Integer id) {
        super("Perfil não encontrado com ID: " + id);
    }
}
