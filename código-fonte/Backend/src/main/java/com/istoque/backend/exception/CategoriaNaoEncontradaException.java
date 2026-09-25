package com.istoque.backend.exception;

public class CategoriaNaoEncontradaException extends RuntimeException {

    public CategoriaNaoEncontradaException(Integer id) {
        super("Categoria não encontrada com o id: " + id);
    }

}
