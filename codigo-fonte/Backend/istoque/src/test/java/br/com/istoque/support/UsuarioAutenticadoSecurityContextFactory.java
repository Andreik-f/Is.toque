package br.com.istoque.support;

import br.com.istoque.security.UsuarioAutenticado;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.test.context.support.WithSecurityContextFactory;

import java.util.List;

/** Monta o contexto de segurança de @WithUsuarioAutenticado: um administrador qualquer. */
class UsuarioAutenticadoSecurityContextFactory
        implements WithSecurityContextFactory<WithUsuarioAutenticado> {

    @Override
    public SecurityContext createSecurityContext(WithUsuarioAutenticado anotacao) {
        UsuarioAutenticado principal =
                new UsuarioAutenticado(1, "logado@teste.com", 1, "Administrador");

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                principal, null, List.of(new SimpleGrantedAuthority("PERFIL_Administrador"))));
        return context;
    }
}
