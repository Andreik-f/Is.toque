package br.com.istoque.security;

import br.com.istoque.exception.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * Responde 401 no formato padrão de erro da API quando a rota exige token e a
 * requisição veio sem ele, ou com token inválido, adulterado, expirado ou de
 * usuário desativado.
 */
@Component
public class RestAuthenticationEntryPoint implements AuthenticationEntryPoint {

    public static final String MENSAGEM = "Sessão expirada ou inválida. Entre novamente.";

    private final ObjectMapper objectMapper;

    public RestAuthenticationEntryPoint(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getWriter(),
                ApiErrorResponse.de(HttpStatus.UNAUTHORIZED.value(), MENSAGEM));
    }
}
