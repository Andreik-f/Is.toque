package br.com.istoque.config;

import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.security.JwtAuthenticationFilter;
import br.com.istoque.security.Permissoes;
import br.com.istoque.security.RestAccessDeniedHandler;
import br.com.istoque.security.RestAuthenticationEntryPoint;
import br.com.istoque.services.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtService jwtService,
                                           UsuarioRepository usuarioRepository,
                                           RestAuthenticationEntryPoint entryPoint,
                                           RestAccessDeniedHandler accessDeniedHandler) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // usa o corsConfigurationSource abaixo
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(erros -> erros
                        .authenticationEntryPoint(entryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // pré-requisição do CORS
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/cadastro", "/api/auth/recuperar-senha/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
                        .requestMatchers("/api/usuarios/me/**").authenticated()
                        .requestMatchers("/api/usuarios/**").hasAuthority(Permissoes.USUARIOS_GERENCIAR)
                        .requestMatchers("/api/relatorios/**").hasAuthority(Permissoes.RELATORIOS_VER)
                        .requestMatchers(HttpMethod.POST, "/api/movimentacoes/ajustes").hasAuthority(Permissoes.ESTOQUE_AJUSTAR)
                        .requestMatchers(HttpMethod.POST, "/api/movimentacoes").hasAuthority(Permissoes.ESTOQUE_MOVIMENTAR)
                        .requestMatchers(HttpMethod.POST, "/api/producoes").hasAuthority(Permissoes.PRODUCAO_REGISTRAR)
                        .requestMatchers(HttpMethod.PUT, "/api/empresas/minha").hasAuthority(Permissoes.EMPRESA_CONFIGURAR)
                        .requestMatchers(HttpMethod.POST, "/api/empresas/minha/telefone/**").hasAuthority(Permissoes.EMPRESA_CONFIGURAR)
                        .requestMatchers(HttpMethod.GET, "/api/**").authenticated()
                        .requestMatchers("/api/produtos/**", "/api/categorias/**").hasAuthority(Permissoes.PRODUTOS_GERENCIAR)
                        .requestMatchers("/api/receitas/**").hasAuthority(Permissoes.RECEITAS_GERENCIAR)
                        .requestMatchers("/api/perfis/**").hasAuthority(Permissoes.PERFIS_GERENCIAR)
                        .anyRequest().authenticated())
                .addFilterBefore(
                        new JwtAuthenticationFilter(jwtService, usuarioRepository),
                        UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    // Endereços do front que podem chamar a API pelo navegador (CORS),
    // definidos em istoque.cors.origens
    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${istoque.cors.origens}") String[] origens) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(origens));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        // o front consulta o health para saber se a API (que dorme no Render gratuito) já acordou
        source.registerCorsConfiguration("/actuator/health", config);
        return source;
    }

    // Configura o BCrypt para gerar os Hashes de senha
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
