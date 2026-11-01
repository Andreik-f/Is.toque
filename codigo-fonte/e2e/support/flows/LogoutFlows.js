import LogoutPage from '../pages/LogoutPage';
import dados from '../../fixtures/dadosBasicos.json';
import env from '../../config/env.js';

export default class LogoutFlows {
  constructor(page) {
    this.page = page;
    this.logoutPage = new LogoutPage(page);
  }

  async realizarLogout() {
    await this.logoutPage.clicarSair();
    await this.logoutPage.validarUrlLogout(env.urlLogout);
    await this.logoutPage.validarTituloLogin(dados.titulo.login);
  }
}
