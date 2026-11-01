import { expect } from '@playwright/test';
import HelpersPage from './HelpersPage';
import loginLocators from '../locators/loginLocators';
import comunsLocators from '../locators/comunsLocators';
import dados from '../../fixtures/dadosBasicos.json';

export default class LoginPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async preencherCampo(nomeCampo, valor) {
    const campo = this.page.locator(loginLocators.getCampo(nomeCampo));
    await this.helpersPage.preencherCampoColandoTexto(campo, valor);
  }

  async clicarBotaoEnvio(textoBotao) {
    const botao = this.page.locator(loginLocators.getBotaoEnvio(textoBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarMostrarOcultarSenha(rotulo) {
    const botao = this.page.locator(comunsLocators.getBotaoPorRotulo(rotulo));
    await this.helpersPage.clicarElemento(botao);
  }

  async clicarLinkEsqueceuSenha() {
    const link = this.page.locator(comunsLocators.getLink(dados.botao.esqueceuSenha));
    await this.helpersPage.clicarElemento(link);
  }

  async validarFormularioVisivel(nomeFormulario) {
    const formulario = this.page.locator(loginLocators.getFormulario(nomeFormulario));
    await this.helpersPage.validarElementoVisivel(formulario);
  }

  async validarErroCampo(rotuloCampo, mensagemEsperada) {
    const erro = this.page.locator(loginLocators.getErroCampo(rotuloCampo));
    await this.helpersPage.validarTextoLocalExato(erro, mensagemEsperada);
  }

  async validarErroFormulario(mensagemEsperada) {
    const erro = this.page.locator(loginLocators.erroFormulario);
    await this.helpersPage.validarTextoLocalExato(erro, mensagemEsperada);
  }

  async validarErroFormularioContendo(trechoEsperado) {
    const erro = this.page.locator(loginLocators.erroFormulario);
    await this.helpersPage.validarTextoContido(erro, trechoEsperado);
  }

  async validarErroFormularioAusente() {
    const erro = this.page.locator(loginLocators.erroFormulario);
    await this.helpersPage.validarElementoNaoVisivel(erro);
  }

  async validarErroFormularioPreenchido() {
    const erro = this.page.locator(loginLocators.erroFormulario);
    await this.helpersPage.validarTextoNaoVazio(erro);
  }

  async validarQuantidadeErroFormulario(quantidade) {
    const erro = this.page.locator(loginLocators.erroFormulario);
    await this.helpersPage.validarQuantidadeElementos(erro, quantidade);
  }

  async validarTipoCampo(nomeCampo, tipoEsperado) {
    const campo = this.page.locator(loginLocators.getCampo(nomeCampo));
    await this.helpersPage.validarAtributo(campo, 'type', tipoEsperado);
  }

  async validarEstadoMostrarSenha(rotulo, pressionadoEsperado) {
    const botao = this.page.locator(comunsLocators.getBotaoPorRotulo(rotulo));
    await this.helpersPage.validarAtributo(botao, 'aria-pressed', pressionadoEsperado);
  }

  async validarSessaoGravada() {
    await expect.poll(() => this.helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento), { timeout: 15000 }).toMatchObject({ token: expect.any(String) });
    const sessao = await this.helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    expect(new Date(sessao.expiraEm).getTime()).toBeGreaterThan(Date.now());
    return sessao;
  }

  async validarSessaoAusente() {
    await this.helpersPage.validarLocalStorageAusente(dados.sessao.chaveArmazenamento);
  }

  async validarUrlLogada(urlEsperada) {
    await this.helpersPage.validarUrl(urlEsperada);
  }
}
