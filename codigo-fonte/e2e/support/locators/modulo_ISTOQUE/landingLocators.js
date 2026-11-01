const landingLocators = {
    getBotaoHero(nomeBotao) {
        return `//section[@aria-labelledby='landing-titulo-hero']//a[normalize-space()='${nomeBotao}']`;
    },
    getLinkCabecalho(nomeLink) {
        return `//header//a[normalize-space()='${nomeLink}']`;
    },
};

export default landingLocators;
