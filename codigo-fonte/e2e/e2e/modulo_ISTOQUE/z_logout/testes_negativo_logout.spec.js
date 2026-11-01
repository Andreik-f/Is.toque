import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LogoutFlows from '../../../support/flows/LogoutFlows.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[logout_negativo] Testes de acesso após o logout', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    const logoutFlows = new LogoutFlows(page);
    await loginFlows.entrarUrlAutenticada();
    await logoutFlows.realizarLogout();
  });

  test('[CT_#0014] Após sair, a empresa não é acessível [logout]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      DEPOIS DE SAIR, ABRE A URL DO ESTOQUE E RECARREGA A PÁGINA; VALIDA QUE O SISTEMA ABRE EM MODO DEMONSTRAÇÃO
      ("Protótipo interativo" E "Dados fictícios"), SEM SESSÃO E SEM NENHUMA CHAMADA À API`);
    test.skip(papelAutenticado !== 'administrador');
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const { menu, rodape, rota, selo } = dados;
    helpersPage.iniciarMonitoramentoApi();
    await helpersPage.abrirURL(`${env.baseURL}/#${rota.estoque}`);
    await helpersPage.recarregarPagina();
    await comunsPage.validarMenuLateralVisivel(menu.estoque);
    await comunsPage.validarTextoTopbar(selo.demonstracao);
    await comunsPage.validarTextoRodape(rodape.demonstracao);
    await helpersPage.validarLocalStorageAusente(dados.sessao.chaveArmazenamento);
    helpersPage.validarNenhumaChamadaApi();
  });
});
