package br.com.istoque.security;

import br.com.istoque.services.PerfilService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class Autorizacao {

    public void exigirTodas(Collection<String> codigos) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Set<String> concedidas = auth == null ? Set.of() : auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet());
        if (!concedidas.containsAll(codigos)) {
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
