package com.istoque.backend.exception;

public class UnidadeMedidaNaoEncontradaException extends RuntimeException {

    public UnidadeMedidaNaoEncontradaException(Integer id) {
        super("Unidade de medida não encontrada com o id: " + id);
    }

}
