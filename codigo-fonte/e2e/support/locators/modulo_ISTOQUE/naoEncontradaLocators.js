const naoEncontradaLocators = {
    secao: "//section[@aria-labelledby='not-found-title']",
    getEtiqueta(texto) {
        return `//section[@aria-labelledby='not-found-title']//span[normalize-space()='${texto}']`;
    },
    getTitulo(texto) {
        return `//section[@aria-labelledby='not-found-title']//h1[normalize-space()='${texto}']`;
    },
    endereco: "//section[@aria-labelledby='not-found-title']//p//code",
    getBotao(nomeBotao) {
        return `//section[@aria-labelledby='not-found-title']//button[normalize-space()='${nomeBotao}']`;
    },
};

export default naoEncontradaLocators;
