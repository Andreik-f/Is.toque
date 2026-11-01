import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import AlertasPage from '../../../support/pages/modulo_ISTOQUE/AlertasPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[alertas_negativo] Testes de alertas sem pendências', () => {
  test('[CT_#0052] Sem pendências, o sino não mostra o ponto indicador [alertas]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UMA EMPRESA ISOLADA SEM PRODUTOS E ENTRA NO PAINEL; VALIDA QUE O SINO NÃO MOSTRA O PONTO INDICADOR;
      ABRE O SINO E VALIDA QUE O MODAL "Sua cozinha pede atenção" NÃO TEM NENHUM PRODUTO CLICÁVEL`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const alertasPage = new AlertasPage(nao_autenticado);
    const { rotulo, titulo } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsolada();
    await loginFlows.abrirLoginComSessao(sessao);
    await alertasPage.abrirURL(env.urlDashboard);
    await alertasPage.validarIndicadorSinoAusente(rotulo.verAlertas);
    await alertasPage.clicarSino(rotulo.verAlertas);
    await alertasPage.validarModalVisivel(titulo.alertas);
    await alertasPage.validarNenhumItemClicavel();
  });
});
