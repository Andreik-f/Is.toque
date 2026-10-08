package br.com.istoque.exception;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * Formato padrão de erro devolvido pela API.
 */
public record ApiErrorResponse(
        OffsetDateTime timestamp,
        int status,
        String message,
        Map<String, String> campos
) {

    public static ApiErrorResponse de(int status, String message) {
        return new ApiErrorResponse(OffsetDateTime.now(), status, message, null);
    }

    public static ApiErrorResponse deValidacao(int status, String message, Map<String, String> campos) {
        return new ApiErrorResponse(OffsetDateTime.now(), status, message, campos);
    }

}
