package br.com.istoque.services.sms;

public interface EnviadorSms {

    void enviar(String telefoneE164, String mensagem);
}
