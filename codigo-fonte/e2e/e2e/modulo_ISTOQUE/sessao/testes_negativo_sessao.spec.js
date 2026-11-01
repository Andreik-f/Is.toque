import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[sessao_negativo] Testes de sessão inválida', () => {
  test('[CT_#0016] Token adulterado encerra a sessão com um aviso só [sessao]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ESTANDO LOGADO, TROCA UM CARACTERE DA ASSINATURA DO TOKEN E RECARREGA A PÁGINA;
      VALIDA QUE O SISTEMA VOLTA PARA O LOGIN COM O AVISO "Sua sessão expirou. Entre novamente." UMA ÚNICA VEZ,
      QUE AS CHAMADAS À API RECEBERAM 401 E QUE A SESSÃO FOI APAGADA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    const loginPage = new LoginPage(page);
    const helpersPage = new HelpersPage(page);
    const { mensagem, sessao: dadosSessao } = dados;
    await loginFlows.entrarUrlAutenticada();
    const sessao = await loginPage.validarSessaoGravada();
    const posicao = sessao.token.length - 10;
    const caractere = sessao.token[posicao] === 'A' ? 'B' : 'A';
    const tokenAdulterado = `${sessao.token.slice(0, posicao)}${caractere}${sessao.token.slice(posicao + 1)}`;
    await helpersPage.gravarLocalStorage(dadosSessao.chaveArmazenamento, { ...sessao, token: tokenAdulterado });
    helpersPage.iniciarMonitoramentoApi();
    await helpersPage.recarregarPagina();
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarErroFormulario(mensagem.sessaoExpirada);
    await loginPage.validarQuantidadeErroFormulario(1);
    helpersPage.validarTodasChamadasApiComStatus(401);
    await loginPage.validarSessaoAusente();
  });
});
