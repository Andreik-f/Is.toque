const comunsLocators = {
    getBotao(nomeBotao) {
        return `//button[normalize-space()='${nomeBotao}']`;
    },
    getBotaoPorRotulo(rotulo) {
        return `//button[@aria-label='${rotulo}']`;
    },
    getLink(nomeLink) {
        return `//a[normalize-space()='${nomeLink}']`;
    },
    getTitulo(textoTitulo) {
        return `//h1[normalize-space()='${textoTitulo}']`;
    },
    getMenuLateral(nomeMenu) {
        return `//aside//nav//a[span[normalize-space()='${nomeMenu}']]`;
    },
    getBotaoMenuLateral(nomeBotao) {
        return `//aside//div[contains(@class,'sidebar-bottom')]//button[normalize-space()='${nomeBotao}']`;
    },
    getTextoTopbar(texto) {
        return `//header//span[normalize-space()='${texto}']`;
    },
    getTextoRodape(texto) {
        return `//main//footer//span[normalize-space()='${texto}']`;
    },
    getNomeEmpresaMenu(nomeEmpresa) {
        return `//aside//div[@class='workspace']//strong[normalize-space()='${nomeEmpresa}']`;
    },
    nomeUsuarioMenu: "//aside//div[@class='user']//strong",
    perfilUsuarioMenu: "//aside//div[@class='user']//small",
    getModal(tituloModal) {
        return `//dialog[.//h2[normalize-space()='${tituloModal}']]`;
    },
    getBotaoModal(nomeBotao) {
        return `//dialog//button[normalize-space()='${nomeBotao}']`;
    },
    getCampoModalPorNome(nomeCampo) {
        return `//dialog//*[self::input or self::select or self::textarea][@name='${nomeCampo}']`;
    },
    avisoModal: "//dialog//div[@role='status']",
    getBotaoCabecalho(nomeBotao) {
        return `//div[contains(@class,'heading-actions')]//button[normalize-space()='${nomeBotao}']`;
    },
    getAvisoPagina(texto) {
        return `//main//div[contains(@class,'notice')][.//span[normalize-space()='${texto}']]`;
    },
    getVazio(tituloVazio) {
        return `//div[contains(@class,'empty')][.//h3[normalize-space()='${tituloVazio}']]`;
    },
    getTextoVazio(tituloVazio, texto) {
        return `//div[contains(@class,'empty')][.//h3[normalize-space()='${tituloVazio}']]/p[normalize-space()='${texto}']`;
    },
    getValorIndicador(rotulo) {
        return `//button[contains(@class,'stat')][.//h3[normalize-space()='${rotulo}']]//strong`;
    },
    mensagemToast: "//div[@role='status' and contains(@class,'toast')]",
};

export default comunsLocators;
