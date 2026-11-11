const recuperarAcessoLocators = {
    getErroCampo(nomeCampo) {
        return `//dialog//p[@id='recovery-${nomeCampo}-error']`;
    },
    alertaReenvio: "//dialog//div[contains(@class,'recovery-resend')]//p[@role='alert']",
    getBotaoContagem(inicioRotulo) {
        return `//dialog//button[starts-with(normalize-space(),'${inicioRotulo}')]`;
    },
};

export default recuperarAcessoLocators;
