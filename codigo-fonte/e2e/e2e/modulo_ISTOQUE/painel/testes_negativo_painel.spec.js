import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import PainelPage from '../../../support/pages/modulo_ISTOQUE/PainelPage.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[painel_negativo] Testes do painel com erro', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0050] Painel quando a API falha ao carregar os dados [painel]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      SIMULA ERRO 500 NA LISTA DE PRODUTOS E ABRE O PAINEL; VALIDA "Não foi possível carregar os dados" COM A MENSAGEM DA API INDISPONÍVEL;
      CLICA EM "Tentar de novo" E VALIDA UMA NOVA CHAMADA E O MESMO ERRO; CLICA EM "Sair" E VALIDA A VOLTA AO LOGIN`);
    test.skip(papelAutenticado !== 'administrador');
    const painelPage = new PainelPage(page);
    const loginPage = new LoginPage(page);
    const helpersPage = new HelpersPage(page);
    const { api, botao, mensagem } = dados;
    await helpersPage.mockarRespostaApi('**/api/produtos/ativos', 'GET', 500, api.erroServidor);
    helpersPage.iniciarMonitoramentoApi();
    await helpersPage.abrirURLERecarregar(env.urlDashboard);
    await painelPage.validarEstadoVazio(mensagem.erroCarregarDados, mensagem.apiNaoRespondeu);
    await helpersPage.aguardarQuantidadeChamadasApi('GET', '/api/produtos/ativos', 1);
    await painelPage.clicarBotao(botao.tentarDeNovo);
    await helpersPage.aguardarQuantidadeChamadasApi('GET', '/api/produtos/ativos', 2);
    await painelPage.validarEstadoVazio(mensagem.erroCarregarDados, mensagem.apiNaoRespondeu);
    await painelPage.clicarBotao(botao.sair);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarSessaoAusente();
  });
});
