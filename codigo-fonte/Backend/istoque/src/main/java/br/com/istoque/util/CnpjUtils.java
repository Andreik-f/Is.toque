package br.com.istoque.util;

public final class CnpjUtils {
    private CnpjUtils() {
        // Construtor privado para evitar instanciação
    }

    public static String formatar(String cnpj) {
        if (cnpj == null ) {
            return null;
        }

        String limpo = cnpj.replaceAll("[^A-Za-z0-9]", "").toUpperCase();
        if (limpo.length() != 14) {
            return cnpj; // Retorna o CNPJ original se não tiver 14 dígitos
        }
        return limpo.substring(0, 2) + "." +
                limpo.substring(2, 5) + "." +
                limpo.substring(5, 8) + "/" +
                limpo.substring(8, 12) + "-" +
                limpo.substring(12);
    }
}
