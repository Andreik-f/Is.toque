package br.com.istoque.support;

import br.com.istoque.security.UsuarioAutenticado;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;

public final class UsuarioDeTeste {

    private static final Integer ID_FORA_DO_BANCO = Integer.MAX_VALUE;

    private UsuarioDeTeste() {
    }

    public static RequestPostProcessor autenticadoComo(Integer empresaId, String perfil) {
        return autenticadoComo(ID_FORA_DO_BANCO, empresaId, perfil);
    }

    public static RequestPostProcessor autenticadoComo(Integer id, Integer empresaId, String perfil) {
        UsuarioAutenticado principal = new UsuarioAutenticado(id, "logado@teste.com", empresaId, perfil);
        return authentication(UsernamePasswordAuthenticationToken.authenticated(
                principal, null, List.of(new SimpleGrantedAuthority("PERFIL_" + perfil))));
    }
}
