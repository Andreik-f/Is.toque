import LoginPage from '../pages/LoginPage';
import HelpersPage from '../pages/HelpersPage';
import env from '../../config/env.js';
import dados from '../../fixtures/dadosBasicos.json';

export default class LoginFlows {
  constructor(page) {
    this.page = page;
    this.loginPage = new LoginPage(page);
    this.helpersPage = new HelpersPage(page);
  }

  async realizarLogin(email, senha) {
    const { campo, botao } = dados;
    await this.loginPage.abrirURL(env.urlLogin);
    await this.loginPage.preencherCampo(campo.email, email);
    await this.loginPage.preencherCampo(campo.senha, senha);
    await this.loginPage.clicarBotaoEnvio(botao.entrar);
    await this.loginPage.validarUrlLogada(env.urlAutenticada);
  }

  async entrarUrlAutenticada() {
    await this.helpersPage.abrirURL(env.urlAutenticada);
  }

  async abrirLoginComSessao(sessao) {
    await this.helpersPage.injetarLocalStorageEAbrir(dados.sessao.chaveArmazenamento, sessao, env.urlLogin, env.urlAutenticada);
  }
}
