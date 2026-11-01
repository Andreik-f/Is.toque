import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[telas_locais_sucesso] Testes do aviso nas telas que não gravam no servidor', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0055] Telas locais avisam que não gravam no servidor [telas_locais]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ESTANDO LOGADO, ABRE EQUIPE, MOVIMENTAÇÕES, RECEITAS E RELATÓRIOS E VALIDA EM CADA UMA O AVISO
      "Esta tela ainda não grava no servidor: o que você registrar aqui vale até recarregar a página."`);
    test.skip(papelAutenticado !== 'administrador');
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const { mensagem, rotasTelasLocais } = dados;
    for (const rota of rotasTelasLocais) {
      await helpersPage.abrirURL(`${env.baseURL}/#${rota}`);
      await comunsPage.validarUrl(`${env.baseURL}/#${rota}`);
      await comunsPage.validarAvisoPagina(mensagem.telaLocal);
    }
  });
});
