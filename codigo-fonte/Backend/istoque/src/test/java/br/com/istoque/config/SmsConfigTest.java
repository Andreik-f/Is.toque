package br.com.istoque.config;

import br.com.istoque.exception.FalhaNoEnvioDeSmsException;
import br.com.istoque.services.sms.EnviadorSms;
import br.com.istoque.services.sms.EnviadorSmsIndisponivel;
import br.com.istoque.services.sms.EnviadorSmsLog;
import br.com.istoque.services.sms.EnviadorSmsTextBee;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SmsConfigTest {

    private final SmsConfig config = new SmsConfig();

    private static MockEnvironment ambiente(String... perfis) {
        MockEnvironment ambiente = new MockEnvironment();
        ambiente.setActiveProfiles(perfis);
        return ambiente;
    }

    @Test
    void provedorLog_valeEmDesenvolvimento() {
        EnviadorSms enviador = config.enviadorSms("log", "", "", ambiente());

        assertInstanceOf(EnviadorSmsLog.class, enviador);
    }

    @Test
    void provedorLog_naoValeEmProducao() {
        EnviadorSms enviador = config.enviadorSms("log", "", "", ambiente("prod"));

        assertInstanceOf(EnviadorSmsIndisponivel.class, enviador);
        assertThrows(FalhaNoEnvioDeSmsException.class, () -> enviador.enviar("+5531987654321", "texto"));
    }

    @Test
    void semProvedor_aAplicacaoSobeEOEnvioFalha() {
        EnviadorSms enviador = config.enviadorSms("", "", "", ambiente("prod"));

        assertInstanceOf(EnviadorSmsIndisponivel.class, enviador);
    }

    @Test
    void textbee_comChaveEDevice_usaOTextBee() {
        EnviadorSms enviador = config.enviadorSms("textbee", "chave", "device", ambiente("prod"));

        assertInstanceOf(EnviadorSmsTextBee.class, enviador);
    }

    @Test
    void textbee_semChaveOuDevice_naoSobe() {
        assertThrows(IllegalStateException.class,
                () -> config.enviadorSms("textbee", "", "device", ambiente("prod")));
        assertThrows(IllegalStateException.class,
                () -> config.enviadorSms("textbee", "chave", "", ambiente("prod")));
    }
}
