import HelpersPage from '../HelpersPage';
import comunsLocators from '../../locators/comunsLocators';

export default class PainelPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarBotao(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotao(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarValorIndicador(rotulo, valorEsperado) {
    const indicador = this.page.locator(comunsLocators.getValorIndicador(rotulo));
    await this.helpersPage.validarTextoLocalExato(indicador, valorEsperado);
  }

  async validarEstadoVazio(tituloVazio, textoVazio) {
    const vazio = this.page.locator(comunsLocators.getVazio(tituloVazio));
    const texto = this.page.locator(comunsLocators.getTextoVazio(tituloVazio, textoVazio));
    await this.helpersPage.validarElementoVisivel(vazio);
    await this.helpersPage.validarElementoVisivel(texto);
  }
}
