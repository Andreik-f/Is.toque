import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[sessao_sucesso] Testes de sessão com sucesso', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0015] Recarregar a página mantém a sessão [sessao]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ESTANDO LOGADO, RECARREGA A PÁGINA E VALIDA QUE O PAINEL CONTINUA ABERTO COM A MESMA SESSÃO
      E QUE TODAS AS CHAMADAS À API SAEM COM O TOKEN`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const { menu, titulo } = dados;
    const sessaoAntes = await loginPage.validarSessaoGravada();
    helpersPage.iniciarMonitoramentoApi();
    await helpersPage.recarregarPagina();
    await loginPage.validarUrlLogada(env.urlAutenticada);
    await comunsPage.validarTitulo(titulo.painel);
    await comunsPage.validarMenuLateralVisivel(menu.visaoGeral);
    const sessaoDepois = await loginPage.validarSessaoGravada();
    expect(sessaoDepois.token).toBe(sessaoAntes.token);
    await helpersPage.aguardarQuantidadeMinimaChamadasApi(3);
    helpersPage.validarChamadasApiComAutorizacao(sessaoAntes.token);
  });
});
