const detalheProdutoLocators = {
    getNomeProduto(nomeProduto) {
        return `//section[contains(@class,'product-detail')]//h2[normalize-space()='${nomeProduto}']`;
    },
    getValorDetalhe(rotulo) {
        return `//section[contains(@class,'product-detail')]//dl/div[dt[normalize-space()='${rotulo}']]/dd`;
    },
    getBotaoDetalhe(nomeBotao) {
        return `//section[contains(@class,'product-detail')]//button[normalize-space()='${nomeBotao}']`;
    },
};

export default detalheProdutoLocators;
