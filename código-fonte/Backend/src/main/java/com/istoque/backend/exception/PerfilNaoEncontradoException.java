package com.istoque.backend.exception;

public class PerfilNaoEncontradoException extends RuntimeException {
    public PerfilNaoEncontradoException(Integer id) {
        super("Perfil não encontrado com ID: " + id);
    }
}
