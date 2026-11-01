import HelpersPage from './HelpersPage';
import comunsLocators from '../locators/comunsLocators';

export default class ComunsPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async clicarBotao(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotao(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarLink(nomeLink) {
    const link = this.page.locator(comunsLocators.getLink(nomeLink));
    await this.helpersPage.clicarElemento(link);
  }

  async clicarMenuLateral(nomeMenu) {
    const menu = this.page.locator(comunsLocators.getMenuLateral(nomeMenu));
    await this.helpersPage.clicarElemento(menu);
  }

  async clicarBotaoMenuLateral(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoMenuLateral(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarMensagemToast(mensagemEsperada) {
    const toast = this.page.locator(comunsLocators.mensagemToast);
    await this.helpersPage.validarTextoContido(toast, mensagemEsperada);
  }

  async validarAvisoPagina(textoAviso) {
    const aviso = this.page.locator(comunsLocators.getAvisoPagina(textoAviso));
    await this.helpersPage.validarElementoVisivel(aviso);
  }

  async validarAvisoPaginaAusente(textoAviso) {
    const aviso = this.page.locator(comunsLocators.getAvisoPagina(textoAviso));
    await this.helpersPage.validarElementoNaoVisivel(aviso);
  }

  async validarTitulo(textoTitulo) {
    const titulo = this.page.locator(comunsLocators.getTitulo(textoTitulo));
    await this.helpersPage.validarElementoVisivel(titulo);
  }

  async validarTextoTopbar(texto) {
    const selo = this.page.locator(comunsLocators.getTextoTopbar(texto));
    await this.helpersPage.validarElementoVisivel(selo);
  }

  async validarTextoRodape(texto) {
    const rodape = this.page.locator(comunsLocators.getTextoRodape(texto));
    await this.helpersPage.validarElementoVisivel(rodape);
  }

  async validarMenuLateralVisivel(nomeMenu) {
    const menu = this.page.locator(comunsLocators.getMenuLateral(nomeMenu));
    await this.helpersPage.validarElementoVisivel(menu);
  }

  async validarMenuLateralAtivo(nomeMenu) {
    const menu = this.page.locator(comunsLocators.getMenuLateral(nomeMenu));
    await this.helpersPage.validarAtributo(menu, 'aria-current', 'page');
  }

  async validarNomeEmpresaMenu(nomeEmpresa) {
    const empresa = this.page.locator(comunsLocators.getNomeEmpresaMenu(nomeEmpresa));
    await this.helpersPage.validarElementoVisivel(empresa);
  }

  async validarNomeEPerfilUsuarioMenu(nomeEsperado, perfilEsperado) {
    const nome = this.page.locator(comunsLocators.nomeUsuarioMenu);
    const perfil = this.page.locator(comunsLocators.perfilUsuarioMenu);
    await this.helpersPage.validarTextoLocalExato(nome, nomeEsperado);
    await this.helpersPage.validarTextoLocalExato(perfil, perfilEsperado);
  }

  async validarUrl(urlEsperada) {
    await this.helpersPage.validarUrl(urlEsperada);
  }
}
