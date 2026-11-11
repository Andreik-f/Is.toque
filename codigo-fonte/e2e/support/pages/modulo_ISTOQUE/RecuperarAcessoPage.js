import HelpersPage from '../HelpersPage';
import comunsLocators from '../../locators/comunsLocators';
import recuperarAcessoLocators from '../../locators/modulo_ISTOQUE/recuperarAcessoLocators';

export default class RecuperarAcessoPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async validarModalVisivel(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoVisivel(modal);
  }

  async validarModalFechado(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoNaoVisivel(modal);
  }

  async preencherCampo(nomeCampo, valor) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.preencherCampoColandoTexto(campo, valor);
  }

  async validarCampoVisivel(nomeCampo) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.validarElementoVisivel(campo);
  }

  async validarValorCampo(nomeCampo, valorEsperado) {
    const campo = this.page.locator(comunsLocators.getCampoModalPorNome(nomeCampo));
    await this.helpersPage.validarValorCampo(campo, valorEsperado);
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

  async validarErroCampo(nomeCampo, mensagemEsperada) {
    const erro = this.page.locator(recuperarAcessoLocators.getErroCampo(nomeCampo));
    await this.helpersPage.validarTextoLocalExato(erro, mensagemEsperada);
  }

  async validarAlertaReenvio(mensagemEsperada) {
    const alerta = this.page.locator(recuperarAcessoLocators.alertaReenvio);
    await this.helpersPage.validarTextoLocalExato(alerta, mensagemEsperada);
  }

  async validarContagemDoReenvio(inicioRotulo) {
    const botao = this.page.locator(recuperarAcessoLocators.getBotaoContagem(inicioRotulo));
    await this.helpersPage.validarElementoDesabilitado(botao);
    const texto = await this.helpersPage.lerTextoLocal(botao);
    return Number(/(\d+)s$/.exec(texto)?.[1]);
  }

  async simularSenhaTrocada() {
    await this.page.route('**/api/auth/recuperar-senha/confirmar', async rota => {
      if (rota.request().method() !== 'POST') return rota.fallback();
      await rota.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    });
  }

  async simularPedidoBloqueado(mensagem) {
    await this.helpersPage.mockarRespostaApi('**/api/auth/recuperar-senha', 'POST', 429, { status: 429, message: mensagem });
  }
}
