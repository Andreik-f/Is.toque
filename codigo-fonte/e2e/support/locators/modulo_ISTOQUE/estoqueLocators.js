const estoqueLocators = {
    getCampoBusca(rotulo) {
        return `//input[@aria-label='${rotulo}']`;
    },
    getCardProduto(nomeProduto) {
        return `//button[contains(@class,'product-card')][.//h3[normalize-space()='${nomeProduto}']]`;
    },
    getBadgeProduto(nomeProduto, status) {
        return `//button[contains(@class,'product-card')][.//h3[normalize-space()='${nomeProduto}']]//span[contains(@class,'badge')][normalize-space()='${status}']`;
    },
    nomesProdutosListados: "//button[contains(@class,'product-card')]//h3",
    getAbaCategoria(nomeCategoria) {
        return `//div[contains(@class,'tabs')]//button[normalize-space()='${nomeCategoria}']`;
    },
    contadorResultado: "//div[contains(@class,'filter-bar')]//span[contains(@class,'result-count')]",
    caixaSomenteEstoqueBaixo: "//label[contains(@class,'check-filter')]//input[@type='checkbox']",
};

export default estoqueLocators;
