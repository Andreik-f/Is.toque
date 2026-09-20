package com.istoque.backend.exception;

public class UsuarioNaoEncontradoException extends RuntimeException {
    public UsuarioNaoEncontradoException(Integer id) {
        super("Usuário não encontrado com ID: " + id);
    }
}
