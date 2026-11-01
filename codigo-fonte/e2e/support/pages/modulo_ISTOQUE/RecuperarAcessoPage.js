import HelpersPage from '../HelpersPage';
import comunsLocators from '../../locators/comunsLocators';

export default class RecuperarAcessoPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async validarModalVisivel(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoVisivel(modal);
  }

  async preencherEmail(nomeCampo, email) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.preencherCampoColandoTexto(campo, email);
  }

  async clicarBotaoModal(nomeBotao) {
    const botao = this.page.locator(comunsLocators.getBotaoModal(nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarAvisoModal(mensagemEsperada) {
    const aviso = this.page.locator(comunsLocators.avisoModal);
    await this.helpersPage.validarTextoContido(aviso, mensagemEsperada);
  }

  async validarAvisoModalAusente() {
    const aviso = this.page.locator(comunsLocators.avisoModal);
    await this.helpersPage.validarElementoNaoVisivel(aviso);
  }

  async validarEmailObrigatorioVazio(nomeCampo) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.validarCampoObrigatorioVazio(campo);
  }
}
