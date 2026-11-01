import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LogoutFlows from '../../../support/flows/LogoutFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';

test.describe('[logout_sucesso] Testes de logout com sucesso', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0013] Sair encerra a sessão e volta para o login [logout]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CLICA EM "Sair" NO MENU E VALIDA A VOLTA PARA A URL DE LOGIN COM O TÍTULO "Login",
      A SESSÃO APAGADA DO NAVEGADOR E A AUSÊNCIA DO AVISO DE SESSÃO EXPIRADA`);
    test.skip(papelAutenticado !== 'administrador');
    const logoutFlows = new LogoutFlows(page);
    const loginPage = new LoginPage(page);
    await loginPage.validarSessaoGravada();
    await logoutFlows.realizarLogout();
    await loginPage.validarSessaoAusente();
    await loginPage.validarErroFormularioAusente();
  });
});
