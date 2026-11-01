import HelpersPage from '../HelpersPage';
import alertasLocators from '../../locators/modulo_ISTOQUE/alertasLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class AlertasPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarSino(rotulo) {
    const sino = this.page.locator(alertasLocators.getSino(rotulo));
    await this.helpersPage.clicarElemento(sino);
  }

  async clicarItemEstoqueBaixo(nomeProduto) {
    const item = this.page.locator(alertasLocators.getItemEstoqueBaixo(nomeProduto));
    await this.helpersPage.clicarElemento(item);
  }

  async validarModalVisivel(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoVisivel(modal);
  }

  async validarModalFechado(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoNaoVisivel(modal);
  }

  async validarSecaoVisivel(tituloSecao) {
    const secao = this.page.locator(alertasLocators.getSecao(tituloSecao));
    await this.helpersPage.validarElementoVisivel(secao);
  }

  async validarIndicadorSinoVisivel(rotulo) {
    const indicador = this.page.locator(alertasLocators.getIndicadorSino(rotulo));
    await this.helpersPage.validarElementoVisivel(indicador);
  }

  async validarIndicadorSinoAusente(rotulo) {
    const indicador = this.page.locator(alertasLocators.getIndicadorSino(rotulo));
    await this.helpersPage.validarQuantidadeElementos(indicador, 0);
  }

  async validarNenhumItemClicavel() {
    const itens = this.page.locator(alertasLocators.itensClicaveis);
    await this.helpersPage.validarQuantidadeElementos(itens, 0);
  }
}
