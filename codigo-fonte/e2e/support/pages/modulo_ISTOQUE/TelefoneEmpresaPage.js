import HelpersPage from '../HelpersPage';
import comunsLocators from '../../locators/comunsLocators';
import telefoneEmpresaLocators from '../../locators/modulo_ISTOQUE/telefoneEmpresaLocators';

const DATA_CONFIRMACAO = '2026-11-07 10:00:00';

export default class TelefoneEmpresaPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirConfiguracoesPeloMenu(nomeLink) {
    await this.helpersPage.clicarElemento(this.page.locator(comunsLocators.getLink(nomeLink)));
  }

  async preencherTelefone(telefone) {
    await this.helpersPage.preencherCampoColandoTexto(this.page.locator(telefoneEmpresaLocators.campoTelefone), telefone);
  }

  async validarValorTelefone(valorEsperado) {
    await this.helpersPage.validarValorCampo(this.page.locator(telefoneEmpresaLocators.campoTelefone), valorEsperado);
  }

  async validarDicaTelefone(textoEsperado) {
    await this.helpersPage.validarTextoContido(this.page.locator(telefoneEmpresaLocators.dicaTelefone), textoEsperado);
  }

  async clicarBotao(nomeBotao) {
    await this.helpersPage.clicarElemento(this.page.locator(telefoneEmpresaLocators.getBotao(nomeBotao)));
  }

  async validarContagemDoReenvio() {
    const botao = this.page.locator(telefoneEmpresaLocators.botaoContagem);
    await this.helpersPage.validarElementoDesabilitado(botao);
    const texto = await this.helpersPage.lerTextoLocal(botao);
    return Number(/(\d+)s$/.exec(texto)?.[1]);
  }

  async validarSelo(textoEsperado) {
    await this.helpersPage.validarTextoLocalExato(this.page.locator(telefoneEmpresaLocators.selo), textoEsperado);
  }

  async validarCampoCodigoVisivel() {
    await this.helpersPage.validarElementoVisivel(this.page.locator(telefoneEmpresaLocators.campoCodigo));
  }

  async validarCampoCodigoAusente() {
    await this.helpersPage.validarElementoNaoVisivel(this.page.locator(telefoneEmpresaLocators.campoCodigo));
  }

  async validarCampoCodigoVazio() {
    await this.helpersPage.validarValorCampo(this.page.locator(telefoneEmpresaLocators.campoCodigo), '');
  }

  async preencherCodigo(codigo) {
    await this.helpersPage.preencherCampoColandoTexto(this.page.locator(telefoneEmpresaLocators.campoCodigo), codigo);
  }

  async validarAlerta(textoEsperado) {
    await this.helpersPage.validarTextoLocalExato(this.page.locator(telefoneEmpresaLocators.alerta), textoEsperado);
  }

  // O código real só existe no log do back, então a confirmação é simulada:
  // a rota de confirmar responde 204.
  async simularConfirmacaoDoCodigo() {
    await this.page.route('**/api/empresas/minha/telefone/confirmar', async rota => {
      if (rota.request().method() !== 'POST') return rota.fallback();
      await rota.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } });
    });
  }

  // Toda leitura da empresa chega com o telefone já confirmado.
  async simularEmpresaComTelefoneConfirmado() {
    await this.page.route('**/api/empresas/minha', async rota => {
      if (rota.request().method() !== 'GET') return rota.fallback();
      await this.responderEmpresaConfirmada(rota);
    });
  }

  async responderEmpresaConfirmada(rota) {
    const resposta = await rota.fetch();
    const corpo = await resposta.json();
    await rota.fulfill({ response: resposta, json: { ...corpo, telefoneVerificadoEm: DATA_CONFIRMACAO } });
  }
}
