package br.com.istoque.services.sms;

import br.com.istoque.exception.FalhaNoEnvioDeSmsException;

public class EnviadorSmsIndisponivel implements EnviadorSms {

    @Override
    public void enviar(String telefoneE164, String mensagem) {
        throw new FalhaNoEnvioDeSmsException();
    }
}
