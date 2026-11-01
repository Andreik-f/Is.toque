package br.com.istoque.security;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;
import tools.jackson.databind.json.JsonMapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RestAccessDeniedHandlerTest {

    private final RestAccessDeniedHandler handler = new RestAccessDeniedHandler(JsonMapper.builder().build());

    @Test
    void handle_devolve403NoFormatoPadraoDeErro() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.handle(new MockHttpServletRequest(), response, new AccessDeniedException("negado"));

        assertEquals(403, response.getStatus());
        assertTrue(response.getContentType().startsWith(MediaType.APPLICATION_JSON_VALUE));
        String corpo = response.getContentAsString();
        assertEquals(Integer.valueOf(403), JsonPath.read(corpo, "$.status"));
        assertEquals("Seu perfil não permite esta ação.", JsonPath.read(corpo, "$.message"));
        assertNotNull(JsonPath.read(corpo, "$.timestamp"));
    }
}
