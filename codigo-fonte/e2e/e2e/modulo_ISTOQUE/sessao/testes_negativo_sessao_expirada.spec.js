import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[sessao_expirada_negativo] Testes de sessão vencida', () => {
  test('[CT_#0017] Sessão com expiraEm no passado abre o login com aviso e sem chamar a API [sessao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      GRAVA NO NAVEGADOR UMA SESSÃO COM expiraEm NO PASSADO, ABRE O PAINEL E RECARREGA;
      VALIDA QUE O SISTEMA VAI PARA O LOGIN COM "Sua sessão expirou. Entre novamente." UMA ÚNICA VEZ,
      SEM NENHUMA CHAMADA À API E COM A SESSÃO APAGADA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { mensagem, sessaoForjada } = dados;
    helpersPage.iniciarMonitoramentoApi();
    await loginFlows.abrirLoginComSessao(sessaoForjada);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarErroFormulario(mensagem.sessaoExpirada);
    await loginPage.validarQuantidadeErroFormulario(1);
    await helpersPage.aguardarRedeOciosa();
    helpersPage.validarNenhumaChamadaApi();
    await loginPage.validarSessaoAusente();
  });
});
