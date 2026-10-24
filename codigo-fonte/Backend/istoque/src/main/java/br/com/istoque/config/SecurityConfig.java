package br.com.istoque.config;

import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.security.JwtAuthenticationFilter;
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
                                           RestAuthenticationEntryPoint entryPoint) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults()) // usa o corsConfigurationSource abaixo
                .sessionManagement(sessao -> sessao.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(erros -> erros.authenticationEntryPoint(entryPoint))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() // pré-requisição do CORS
                        .requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/cadastro").permitAll()
                        .requestMatchers(HttpMethod.GET, "/actuator/health").permitAll()
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
        return source;
    }

    // Configura o BCrypt para gerar os Hashes de senha
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}