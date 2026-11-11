import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[sessao_expirada_negativo] Testes de sessão vencida', () => {
  test('[CT_#0017] Sessão com expiraEm no passado abre o login sem aviso e sem chamar a API [sessao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      GRAVA NO NAVEGADOR UMA SESSÃO COM expiraEm NO PASSADO, ABRE O PAINEL E RECARREGA;
      VALIDA QUE O SISTEMA VAI PARA O LOGIN SEM O AVISO "Sua sessão expirou. Entre novamente."
      (QUEM VOLTA DEPOIS DE UM TEMPO NÃO FOI INTERROMPIDO), SEM NENHUMA CHAMADA À API E COM A SESSÃO APAGADA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { formulario, sessaoForjada } = dados;
    helpersPage.iniciarMonitoramentoApi();
    await loginFlows.abrirLoginComSessao(sessaoForjada);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarFormularioVisivel(formulario.login);
    await helpersPage.aguardarRedeOciosa();
    await loginPage.validarErroFormularioAusente();
    helpersPage.validarNenhumaChamadaApi();
    await loginPage.validarSessaoAusente();
  });
});
