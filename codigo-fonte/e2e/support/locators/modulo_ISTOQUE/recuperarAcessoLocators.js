const recuperarAcessoLocators = {
    getErroCampo(nomeCampo) {
        return `//dialog//p[@id='recovery-${nomeCampo}-error']`;
    },
    getBotaoContagem(inicioRotulo) {
        return `//dialog//button[starts-with(normalize-space(),'${inicioRotulo}')]`;
    },
};

export default recuperarAcessoLocators;
