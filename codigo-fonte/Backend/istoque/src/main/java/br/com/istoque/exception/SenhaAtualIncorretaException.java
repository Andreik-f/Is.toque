package br.com.istoque.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class SenhaAtualIncorretaException extends RuntimeException {
    public SenhaAtualIncorretaException(String mensagem) {
        super(mensagem);
    }
}