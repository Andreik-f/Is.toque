package br.com.istoque.services.sms;

import br.com.istoque.util.TelefoneUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class EnviadorSmsLog implements EnviadorSms {

    private static final Logger log = LoggerFactory.getLogger(EnviadorSmsLog.class);

    @Override
    public void enviar(String telefoneE164, String mensagem) {
        log.info("SMS de desenvolvimento para {}: {}", TelefoneUtils.mascarar(telefoneE164), mensagem);
    }
}
