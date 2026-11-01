const loginLocators = {
    getFormulario(nomeFormulario) {
        return `//form[@aria-label='${nomeFormulario}']`;
    },
    getCampo(nomeCampo) {
        return `//form//input[@name='${nomeCampo}']`;
    },
    getErroCampo(rotuloCampo) {
        return `//div[@data-invalid='true'][.//label[normalize-space()='${rotuloCampo}']]//p[@role='alert']`;
    },
    getBotaoEnvio(textoBotao) {
        return `//form//button[@type='submit'][normalize-space()='${textoBotao}']`;
    },
    erroFormulario: "//form/p[@role='alert']",
};

export default loginLocators;
