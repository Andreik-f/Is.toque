import HelpersPage from '../HelpersPage';
import produtoModalLocators from '../../locators/modulo_ISTOQUE/produtoModalLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class ProdutoModalPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async preencherCampo(nomeCampo, valor) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.preencherCampoColandoTexto(campo, valor);
  }

  async selecionarOpcao(nomeCampo, textoOpcao) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.selecionarOpcaoPorTexto(campo, textoOpcao);
  }

  async clicarBotaoModal(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoModal(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarBotaoModalEAguardarResposta(nomeBotao, metodo, trechoUrl) {
    const botao = this.page.locator(comunsLocators.getBotaoModal(nomeBotao));
    await this.helpersPage.validarElementoVisivel(botao);
    return this.helpersPage.executarAcaoEAguardarRespostaApi(metodo, trechoUrl, () => botao.click());
  }

  async anexarFoto(rotuloCampo, caminho) {
    const entrada = this.page.locator(produtoModalLocators.getInputArquivo(rotuloCampo));
    await this.helpersPage.selecionarArquivo(entrada, caminho);
  }

  async validarModalVisivel(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoVisivel(modal);
  }

  async validarModalFechado(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoNaoVisivel(modal);
  }

  async validarBotaoModalVisivel(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoModal(nomeBotao));
    await this.helpersPage.validarElementoVisivel(botao);
  }

  async validarBotaoModalAusente(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoModal(nomeBotao));
    await this.helpersPage.validarElementoNaoVisivel(botao);
  }

  async validarCampoObrigatorioVazio(nomeCampo) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.validarCampoObrigatorioVazio(campo);
  }

  async validarCampoDesabilitado(nomeCampo) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.validarElementoDesabilitado(campo);
  }

  async validarErroFormulario(mensagemEsperada) {
    const erro = this.page.locator(produtoModalLocators.erroFormulario);
    await this.helpersPage.validarTextoLocalExato(erro, mensagemEsperada);
  }

  async validarErroFormularioPreenchido() {
    const erro = this.page.locator(produtoModalLocators.erroFormulario);
    await this.helpersPage.validarTextoNaoVazio(erro);
  }

  async validarErroFoto(mensagemEsperada) {
    const erro = this.page.locator(produtoModalLocators.erroFoto);
    await this.helpersPage.validarTextoLocalExato(erro, mensagemEsperada);
  }

  async validarDicaCampo(rotuloCampo, textoEsperado) {
    const dica = this.page.locator(produtoModalLocators.getDicaCampo(rotuloCampo));
    await this.helpersPage.validarTextoLocalExato(dica, textoEsperado);
  }

  async lerOpcoesCampo(nomeCampo) {
    const opcoes = this.page.locator(produtoModalLocators.getOpcoesSelect(nomeCampo));
    await this.helpersPage.validarElementoVisivel(this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo)));
    return this.helpersPage.lerTextosLocais(opcoes);
  }
}
