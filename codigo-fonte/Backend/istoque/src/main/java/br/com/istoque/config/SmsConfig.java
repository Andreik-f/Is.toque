package br.com.istoque.config;

import br.com.istoque.services.sms.EnviadorSms;
import br.com.istoque.services.sms.EnviadorSmsIndisponivel;
import br.com.istoque.services.sms.EnviadorSmsLog;
import br.com.istoque.services.sms.EnviadorSmsTextBee;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class SmsConfig {

    private static final Duration TEMPO_LIMITE = Duration.ofSeconds(10);

    @Bean
    public EnviadorSms enviadorSms(@Value("${istoque.sms.provedor:}") String provedor,
                                   @Value("${textbee.api-key:}") String apiKey,
                                   @Value("${textbee.device-id:}") String deviceId,
                                   Environment ambiente) {
        if ("textbee".equalsIgnoreCase(provedor)) {
            if (apiKey.isBlank() || deviceId.isBlank()) {
                throw new IllegalStateException(
                        "SMS_PROVEDOR=textbee exige as variáveis TEXTBEE_API_KEY e TEXTBEE_DEVICE_ID");
            }
            return new EnviadorSmsTextBee(clienteHttp(), apiKey, deviceId);
        }
        if ("log".equalsIgnoreCase(provedor) && !ambiente.acceptsProfiles(Profiles.of("prod"))) {
            return new EnviadorSmsLog();
        }
        return new EnviadorSmsIndisponivel();
    }

    private RestClient clienteHttp() {
        SimpleClientHttpRequestFactory fabrica = new SimpleClientHttpRequestFactory();
        fabrica.setConnectTimeout(TEMPO_LIMITE);
        fabrica.setReadTimeout(TEMPO_LIMITE);
        return RestClient.builder().requestFactory(fabrica).build();
    }
}
