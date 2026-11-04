package br.com.istoque.services.sms;

import br.com.istoque.exception.FalhaNoEnvioDeSmsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.List;
import java.util.Map;

public class EnviadorSmsTextBee implements EnviadorSms {

    private static final Logger log = LoggerFactory.getLogger(EnviadorSmsTextBee.class);
    private static final String URL_ENVIO = "https://api.textbee.dev/api/v1/gateway/send-sms";

    private final RestClient restClient;
    private final String apiKey;
    private final String deviceId;

    public EnviadorSmsTextBee(RestClient restClient, String apiKey, String deviceId) {
        this.restClient = restClient;
        this.apiKey = apiKey;
        this.deviceId = deviceId;
    }

    @Override
    public void enviar(String telefoneE164, String mensagem) {
        try {
            restClient.post()
                    .uri(URL_ENVIO)
                    .header("x-api-key", apiKey)
                    .body(Map.of(
                            "recipients", List.of(telefoneE164),
                            "message", mensagem,
                            "deviceId", deviceId))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error("Falha ao enviar SMS pelo TextBee: {}", e.getClass().getSimpleName());
            throw new FalhaNoEnvioDeSmsException();
        }
    }
}
