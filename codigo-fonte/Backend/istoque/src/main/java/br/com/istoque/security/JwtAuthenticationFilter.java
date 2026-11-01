package br.com.istoque.security;

import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.services.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Lê "Authorization: Bearer <token>", valida o token e confere no banco se o
 * usuário continua ativo (quem foi desativado depois do login cai aqui).
 *
 * Este filtro nunca responde erro: se algo estiver errado, apenas não autentica
 * a requisição. Quem devolve o 401 é o RestAuthenticationEntryPoint, e só nas
 * rotas que exigem login. Por isso ele NÃO é @Component (seria registrado em
 * duplicidade); é criado no SecurityConfig.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String PREFIXO = "Bearer ";

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UsuarioRepository usuarioRepository) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(PREFIXO)) {
            autenticar(header.substring(PREFIXO.length()).trim());
        }
        chain.doFilter(request, response);
    }

    private void autenticar(String token) {
        try {
            Claims claims = jwtService.validarToken(token);
            Integer usuarioId = claims.get("usuarioId", Integer.class);
            if (usuarioId == null) {
                return;
            }

            usuarioRepository.findById(usuarioId)
                    .filter(usuario -> Boolean.TRUE.equals(usuario.getAtivo()))
                    .ifPresent(usuario -> {
                        // empresa e perfil vêm do banco, não do token: se mudarem, valem na hora
                        UsuarioAutenticado principal = new UsuarioAutenticado(
                                usuario.getId(),
                                usuario.getEmail(),
                                usuario.getEmpresa().getId(),
                                usuario.getPerfil().getNome());

                        var authentication = UsernamePasswordAuthenticationToken.authenticated(
                                principal, null,
                                usuario.getPerfil().getPermissoes().stream()
                                        .map(p -> new SimpleGrantedAuthority(p.getCodigo()))
                                        .toList());

                        SecurityContext context = SecurityContextHolder.createEmptyContext();
                        context.setAuthentication(authentication);
                        SecurityContextHolder.setContext(context);
                    });
        } catch (JwtException | IllegalArgumentException ex) {
            // token expirado, adulterado ou mal formado: segue sem autenticar
            log.debug("Token rejeitado: {}", ex.getMessage());
        }
    }
}
