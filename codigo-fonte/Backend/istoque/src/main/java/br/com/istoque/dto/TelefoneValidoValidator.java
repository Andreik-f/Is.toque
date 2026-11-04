package br.com.istoque.dto;

import br.com.istoque.util.TelefoneUtils;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class TelefoneValidoValidator implements ConstraintValidator<TelefoneValido, String> {

    @Override
    public boolean isValid(String telefone, ConstraintValidatorContext contexto) {
        return TelefoneUtils.valido(telefone);
    }
}
