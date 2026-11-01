package br.com.istoque.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AutorizacaoTest {

    private final Autorizacao autorizacao = new Autorizacao();

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void exigirTodas_comTodosOsCodigos_naoLanca() {
        logarComPermissoes(Permissoes.PRODUTOS_GERENCIAR, Permissoes.ESTOQUE_AJUSTAR);

        assertDoesNotThrow(() -> autorizacao.exigirTodas(
                List.of(Permissoes.PRODUTOS_GERENCIAR, Permissoes.ESTOQUE_AJUSTAR)));
    }

    @Test
    void exigirTodas_comListaVazia_naoLanca() {
        logarComPermissoes();

        assertDoesNotThrow(() -> autorizacao.exigirTodas(List.of()));
    }

    @Test
    void exigirTodas_faltandoUmCodigo_lancaAccessDenied() {
        logarComPermissoes(Permissoes.PRODUTOS_GERENCIAR);

        AccessDeniedException ex = assertThrows(AccessDeniedException.class, () -> autorizacao.exigirTodas(
                List.of(Permissoes.PRODUTOS_GERENCIAR, Permissoes.USUARIOS_GERENCIAR)));
        assertEquals(RestAccessDeniedHandler.MENSAGEM, ex.getMessage());
    }

    @Test
    void exigirTodas_semAutenticacao_lancaAccessDenied() {
        assertThrows(AccessDeniedException.class,
                () -> autorizacao.exigirTodas(List.of(Permissoes.PRODUTOS_GERENCIAR)));
    }

    @Test
    void ehAdministrador_comparaComOPerfilAdministrador() {
        assertEquals("Administrador", autorizacao.perfilAdministrador());
        assertTrue(autorizacao.ehAdministrador("Administrador"));
        assertFalse(autorizacao.ehAdministrador("Gerente"));
        assertFalse(autorizacao.ehAdministrador(null));
    }

    private void logarComPermissoes(String... codigos) {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        new UsuarioAutenticado(1, "a@teste.com", 1, "Qualquer"), null,
                        java.util.Arrays.stream(codigos).map(SimpleGrantedAuthority::new).toList()));
    }
}
