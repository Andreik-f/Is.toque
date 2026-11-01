import HelpersPage from '../HelpersPage';
import landingLocators from '../../locators/modulo_ISTOQUE/landingLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class LandingPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async validarTituloHero(textoEsperado) {
    const titulo = this.page.locator(comunsLocators.getTitulo(textoEsperado));
    await this.helpersPage.validarElementoVisivel(titulo);
  }

  async clicarBotaoHero(nomeBotao) {
    const botao = this.page.locator(landingLocators.getBotaoHero(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarLinkCabecalho(nomeLink) {
    const link = this.page.locator(landingLocators.getLinkCabecalho(nomeLink));
    await this.helpersPage.clicarElemento(link);
  }
}
