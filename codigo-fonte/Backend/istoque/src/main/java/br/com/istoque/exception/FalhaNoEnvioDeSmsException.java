package br.com.istoque.exception;

public class FalhaNoEnvioDeSmsException extends RuntimeException {

    public FalhaNoEnvioDeSmsException() {
        super("Não foi possível enviar o SMS agora. Tente novamente mais tarde");
    }
}
