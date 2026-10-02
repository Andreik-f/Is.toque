package br.com.istoque.util;

import java.util.Locale;

public final class EmailUtils {
    private EmailUtils() {
        // Construtor privado para evitar instanciação
    }

    /**
     * Deixa o e-mail num formato único (sem espaços nas pontas e em
     * minúsculas), para que "Ana@Loja.com" e "ana@loja.com" sejam a mesma conta.
     */
    public static String normalizar(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
