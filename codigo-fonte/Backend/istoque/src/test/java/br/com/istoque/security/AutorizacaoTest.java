package br.com.istoque.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AutorizacaoTest {

    private final Autorizacao autorizacao = new Autorizacao(new UsuarioLogado());

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void exigirAdministrador_comAdministrador_naoLanca() {
        logarComo("Administrador");

        assertDoesNotThrow(autorizacao::exigirAdministrador);
    }

    @ParameterizedTest
    @ValueSource(strings = {"Gerente", "Funcionário"})
    void exigirAdministrador_comOutroPerfil_lancaAccessDenied(String perfil) {
        logarComo(perfil);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, autorizacao::exigirAdministrador);
        assertEquals(RestAccessDeniedHandler.MENSAGEM, ex.getMessage());
    }

    @Test
    void ehAdministrador_comparaComOPerfilAdministrador() {
        assertEquals("Administrador", autorizacao.perfilAdministrador());
        assertTrue(autorizacao.ehAdministrador("Administrador"));
        assertFalse(autorizacao.ehAdministrador("Gerente"));
        assertFalse(autorizacao.ehAdministrador(null));
    }

    private void logarComo(String perfil) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        new UsuarioAutenticado(1, "a@teste.com", 1, perfil), null, List.of()));
    }
}
