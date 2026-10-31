package br.com.istoque.exception;

public class QuantidadeFracionadaNaoPermitidaException extends RuntimeException {

    private final String campo;

    public QuantidadeFracionadaNaoPermitidaException(int indice, String produtoNome, String unidadeSigla) {
        super("A unidade '" + unidadeSigla + "' do produto '" + produtoNome + "' não aceita quantidade fracionada");
        this.campo = "itens[" + indice + "].quantidade";
    }

    public String getCampo() {
        return campo;
    }

}
