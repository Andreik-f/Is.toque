package br.com.istoque.security;

import br.com.istoque.services.PerfilService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

@Component
public class Autorizacao {

    private final UsuarioLogado usuarioLogado;

    public Autorizacao(UsuarioLogado usuarioLogado) {
        this.usuarioLogado = usuarioLogado;
    }

    public void exigirAdministrador() {
        if (!ehAdministrador(usuarioLogado.perfil())) {
            throw new AccessDeniedException(RestAccessDeniedHandler.MENSAGEM);
        }
    }

    public boolean ehAdministrador(String perfil) {
        return perfilAdministrador().equals(perfil);
    }

    public String perfilAdministrador() {
        return PerfilService.ADMINISTRADOR;
    }
}
