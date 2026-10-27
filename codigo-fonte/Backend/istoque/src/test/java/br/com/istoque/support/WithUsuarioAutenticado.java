package br.com.istoque.support;

import org.springframework.security.test.context.support.WithSecurityContext;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

/**
 * Faz o teste rodar como um usuário já logado (HT001), para os testes dos
 * controllers que não são sobre autenticação não precisarem montar um token.
 *
 * O usuário é só um valor em memória: não passa pelo JwtAuthenticationFilter
 * nem consulta o banco. A validação do token de verdade (inválido, expirado,
 * usuário desativado) fica em AutenticacaoJwtIntegrationTest.
 */
@Retention(RetentionPolicy.RUNTIME)
@WithSecurityContext(factory = UsuarioAutenticadoSecurityContextFactory.class)
public @interface WithUsuarioAutenticado {

    int id() default 1;

    int empresaId() default 1;

    String perfil() default "Administrador";
}
