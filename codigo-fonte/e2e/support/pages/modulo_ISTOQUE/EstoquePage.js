import HelpersPage from '../HelpersPage';
import estoqueLocators from '../../locators/modulo_ISTOQUE/estoqueLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class EstoquePage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarBotaoCabecalho(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoCabecalho(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarBotao(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotao(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async buscarIngrediente(rotuloCampo, texto) {
    const campo = this.page.locator(estoqueLocators.getCampoBusca(rotuloCampo));
    await this.helpersPage.preencherCampoColandoTexto(campo, texto);
  }

  async clicarCardProduto(nomeProduto) {
    const card = this.page.locator(estoqueLocators.getCardProduto(nomeProduto));
    await this.helpersPage.clicarElemento(card);
  }

  async clicarAbaCategoria(nomeCategoria) {
    const aba = this.page.locator(estoqueLocators.getAbaCategoria(nomeCategoria));
    await this.helpersPage.clicarElemento(aba);
  }

  async marcarSomenteEstoqueBaixo() {
    const caixa = this.page.locator(estoqueLocators.caixaSomenteEstoqueBaixo);
    await this.helpersPage.marcarCaixa(caixa);
  }

  async validarCardProdutoVisivel(nomeProduto) {
    const card = this.page.locator(estoqueLocators.getCardProduto(nomeProduto));
    await this.helpersPage.validarElementoVisivel(card);
  }

  async validarCardProdutoAusente(nomeProduto) {
    const card = this.page.locator(estoqueLocators.getCardProduto(nomeProduto));
    await this.helpersPage.validarElementoNaoVisivel(card);
  }

  async validarBadgeProduto(nomeProduto, status) {
    const badge = this.page.locator(estoqueLocators.getBadgeProduto(nomeProduto, status));
    await this.helpersPage.validarElementoVisivel(badge);
  }

  async validarAbaCategoriaVisivel(nomeCategoria) {
    const aba = this.page.locator(estoqueLocators.getAbaCategoria(nomeCategoria));
    await this.helpersPage.validarElementoVisivel(aba);
  }

  async validarContadorResultado(textoEsperado) {
    const contador = this.page.locator(estoqueLocators.contadorResultado);
    await this.helpersPage.validarTextoLocalExato(contador, textoEsperado);
  }

  async validarCampoBuscaVazio(rotuloCampo) {
    const campo = this.page.locator(estoqueLocators.getCampoBusca(rotuloCampo));
    await this.helpersPage.validarValorCampo(campo, '');
  }

  async validarEstadoVazio(tituloVazio, textoVazio) {
    const vazio = this.page.locator(comunsLocators.getVazio(tituloVazio));
    const texto = this.page.locator(comunsLocators.getTextoVazio(tituloVazio, textoVazio));
    await this.helpersPage.validarElementoVisivel(vazio);
    await this.helpersPage.validarElementoVisivel(texto);
  }
}
