import HelpersPage from '../HelpersPage';
import detalheProdutoLocators from '../../locators/modulo_ISTOQUE/detalheProdutoLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class DetalheProdutoPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarBotaoDetalhe(nomeBotao) {
    const botao = this.page.locator(detalheProdutoLocators.getBotaoDetalhe(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarBotaoVoltar(textoBotao) {
    const botao = this.page.locator(comunsLocators.getBotao(textoBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarNomeProduto(nomeProduto) {
    const nome = this.page.locator(detalheProdutoLocators.getNomeProduto(nomeProduto));
    await this.helpersPage.validarElementoVisivel(nome);
  }

  async validarValorDetalheContendo(rotulo, trechoEsperado) {
    const valor = this.page.locator(detalheProdutoLocators.getValorDetalhe(rotulo));
    await this.helpersPage.validarTextoContido(valor, trechoEsperado);
  }

  async validarEstadoVazio(tituloVazio, textoVazio) {
    const vazio = this.page.locator(comunsLocators.getVazio(tituloVazio));
    const texto = this.page.locator(comunsLocators.getTextoVazio(tituloVazio, textoVazio));
    await this.helpersPage.validarElementoVisivel(vazio);
    await this.helpersPage.validarElementoVisivel(texto);
  }
}
