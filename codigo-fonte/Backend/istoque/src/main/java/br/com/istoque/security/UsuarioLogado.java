package br.com.istoque.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Uso nos serviços das próximas histórias, em vez de receber empresa/usuário
 * no corpo ou na URL:
 *
 *   Integer empresaId = usuarioLogado.empresaId();
 */
@Component
public class UsuarioLogado {

    public UsuarioAutenticado get() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UsuarioAutenticado usuario) {
            return usuario;
        }
        throw new IllegalStateException("Nenhum usuário autenticado nesta requisição");
    }

    public Integer id() {
        return get().id();
    }

    public Integer empresaId() {
        return get().empresaId();
    }

    public String perfil() {
        return get().perfil();
    }
}
