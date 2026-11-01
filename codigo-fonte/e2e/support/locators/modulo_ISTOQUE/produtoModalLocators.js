const produtoModalLocators = {
    getOpcoesSelect(nomeCampo) {
        return `//dialog//select[@name='${nomeCampo}']/option`;
    },
    getInputArquivo(rotuloCampo) {
        return `//dialog//input[@type='file'][@aria-label='${rotuloCampo}']`;
    },
    getDicaCampo(rotuloCampo) {
        return `//dialog//label[span[normalize-space()='${rotuloCampo}']]//small`;
    },
    erroFormulario: "//dialog//form/p[@role='alert']",
    erroFoto: "//dialog//section[contains(@class,'photo-field')]//p[@role='alert']",
};

export default produtoModalLocators;
