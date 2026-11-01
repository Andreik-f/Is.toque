const reposicaoLocators = {
    getLinhaProduto(nomeProduto) {
        return `//table//tbody/tr[td[count(//table//thead//th[normalize-space()='Ingrediente']/preceding-sibling::th)+1]/strong[normalize-space()='${nomeProduto}']]`;
    },
    getCelulaLinha(nomeProduto, nomeColuna) {
        return `//table//tbody/tr[td[count(//table//thead//th[normalize-space()='Ingrediente']/preceding-sibling::th)+1]/strong[normalize-space()='${nomeProduto}']]/td[count(//table//thead//th[normalize-space()='${nomeColuna}']/preceding-sibling::th)+1]`;
    },
    getBotaoLinha(nomeProduto, nomeBotao) {
        return `//table//tbody/tr[td[count(//table//thead//th[normalize-space()='Ingrediente']/preceding-sibling::th)+1]/strong[normalize-space()='${nomeProduto}']]//button[normalize-space()='${nomeBotao}']`;
    },
};

export default reposicaoLocators;
