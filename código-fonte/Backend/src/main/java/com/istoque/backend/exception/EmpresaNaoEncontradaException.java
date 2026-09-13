package com.istoque.backend.exception;

public class EmpresaNaoEncontradaException extends RuntimeException {

    public EmpresaNaoEncontradaException(Integer id) {
        super("Empresa não encontrada com o id: " + id);
    }

}
