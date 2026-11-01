import HelpersPage from './HelpersPage';
import logoutLocators from '../locators/logoutLocators';
import comunsLocators from '../locators/comunsLocators';
import dados from '../../fixtures/dadosBasicos.json';

export default class LogoutPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async clicarSair() {
    const botao = this.page.locator(comunsLocators.getBotaoMenuLateral(dados.botao.sair));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarTituloLogin(textoEsperado) {
    const titulo = this.page.locator(logoutLocators.getTituloLogin(textoEsperado));
    await this.helpersPage.validarElementoVisivel(titulo);
  }

  async validarUrlLogout(urlEsperada) {
    await this.helpersPage.validarUrl(urlEsperada);
  }
}
