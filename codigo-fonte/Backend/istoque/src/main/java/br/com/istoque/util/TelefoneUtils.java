package br.com.istoque.util;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberType;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import java.util.Optional;

public final class TelefoneUtils {

    private static final String REGIAO_PADRAO = "BR";
    private static final PhoneNumberUtil UTIL = PhoneNumberUtil.getInstance();

    private TelefoneUtils() {
    }

    public static boolean valido(String telefone) {
        return telefone == null || telefone.isBlank() || interpretar(telefone).isPresent();
    }

    public static String normalizar(String telefone) {
        if (telefone == null || telefone.isBlank()) {
            return null;
        }
        PhoneNumber numero = interpretar(telefone)
                .orElseThrow(() -> new IllegalArgumentException("Telefone inválido"));
        return UTIL.format(numero, PhoneNumberFormat.E164);
    }

    public static boolean ehCelular(String telefoneE164) {
        return interpretar(telefoneE164)
                .map(UTIL::getNumberType)
                .map(tipo -> tipo == PhoneNumberType.MOBILE || tipo == PhoneNumberType.FIXED_LINE_OR_MOBILE)
                .orElse(false);
    }

    public static String mascarar(String telefoneE164) {
        if (telefoneE164 == null || telefoneE164.length() < 4) {
            return "***";
        }
        return "***" + telefoneE164.substring(telefoneE164.length() - 4);
    }

    private static Optional<PhoneNumber> interpretar(String telefone) {
        try {
            PhoneNumber numero = UTIL.parse(telefone.trim(), REGIAO_PADRAO);
            return UTIL.isValidNumber(numero) ? Optional.of(numero) : Optional.empty();
        } catch (NumberParseException e) {
            return Optional.empty();
        }
    }
}
