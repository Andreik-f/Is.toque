import HelpersPage from '../HelpersPage';
import naoEncontradaLocators from '../../locators/modulo_ISTOQUE/naoEncontradaLocators';

export default class NaoEncontradaPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarBotao(nomeBotao) {
    const botao = this.page.locator(naoEncontradaLocators.getBotao(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarEtiqueta(textoEsperado) {
    const etiqueta = this.page.locator(naoEncontradaLocators.getEtiqueta(textoEsperado));
    await this.helpersPage.validarElementoVisivel(etiqueta);
  }

  async validarTitulo(textoEsperado) {
    const titulo = this.page.locator(naoEncontradaLocators.getTitulo(textoEsperado));
    await this.helpersPage.validarElementoVisivel(titulo);
  }

  async validarEndereco(enderecoEsperado) {
    const endereco = this.page.locator(naoEncontradaLocators.endereco);
    await this.helpersPage.validarTextoLocalExato(endereco, enderecoEsperado);
  }

  async validarPaginaAusente() {
    const secao = this.page.locator(naoEncontradaLocators.secao);
    await this.helpersPage.validarElementoNaoVisivel(secao);
  }
}
