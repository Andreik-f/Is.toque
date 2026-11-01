const alertasLocators = {
    getSino(rotulo) {
        return `//header//button[@aria-label='${rotulo}']`;
    },
    getIndicadorSino(rotulo) {
        return `//header//button[@aria-label='${rotulo}']/i`;
    },
    getSecao(tituloSecao) {
        return `//dialog//h3[normalize-space()='${tituloSecao}']`;
    },
    getItemEstoqueBaixo(nomeProduto) {
        return `//dialog//button[contains(@class,'list-link')][span[normalize-space()='${nomeProduto}']]`;
    },
    itensClicaveis: "//dialog//button[contains(@class,'list-link')]",
};

export default alertasLocators;
