package br.com.istoque.security;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

/**
 * Testes unitários do UsuarioLogado (HT001): os serviços pegam id, empresa e
 * perfil de quem está logado sem receber esses dados no corpo ou na URL. Não
 * sobe o Spring.
 */
class UsuarioLogadoTest {

    private final UsuarioLogado usuarioLogado = new UsuarioLogado();

    @AfterEach
    void limparContexto() {
        SecurityContextHolder.clearContext();
    }

    /** Com um usuário autenticado, devolve o id, a empresa e o perfil dele. */
    @Test
    void get_comUsuarioAutenticado_devolveIdEmpresaEPerfil() {
        SecurityContextHolder.getContext().setAuthentication(
                UsernamePasswordAuthenticationToken.authenticated(
                        new UsuarioAutenticado(5, "a@teste.com", 9, "Gerente"), null, List.of()));

        assertEquals(5, usuarioLogado.id());
        assertEquals(9, usuarioLogado.empresaId());
        assertEquals("Gerente", usuarioLogado.perfil());
    }

    /** Sem ninguém autenticado, falha de forma clara em vez de devolver null. */
    @Test
    void get_semUsuarioAutenticado_lancaIllegalState() {
        assertThrows(IllegalStateException.class, usuarioLogado::get);
    }
}
