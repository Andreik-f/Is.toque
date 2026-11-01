import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[telas_locais_negativo] Testes das telas que gravam no servidor', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0056] Telas com API não exibem o aviso de tela local [telas_locais]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ESTANDO LOGADO, ABRE PAINEL, ESTOQUE E REPOSIÇÃO E VALIDA QUE O AVISO
      "Esta tela ainda não grava no servidor..." NÃO APARECE EM NENHUMA DELAS`);
    test.skip(papelAutenticado !== 'administrador');
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const { mensagem, rotasTelasComApi } = dados;
    for (const rota of rotasTelasComApi) {
      await helpersPage.abrirURL(`${env.baseURL}/#${rota}`);
      await comunsPage.validarUrl(`${env.baseURL}/#${rota}`);
      await comunsPage.validarAvisoPaginaAusente(mensagem.telaLocal);
    }
  });
});
