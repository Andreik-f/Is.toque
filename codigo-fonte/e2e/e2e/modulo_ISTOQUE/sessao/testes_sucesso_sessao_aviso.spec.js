import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[sessao_aviso_sucesso] Testes do aviso de sessão expirada ao entrar de novo', () => {
  test('[CT_#0060] O aviso de sessão expirada some quando a pessoa envia o login [sessao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE O LOGIN COM UMA SESSÃO VENCIDA E VALIDA O AVISO "Sua sessão expirou. Entre novamente.";
      ENVIA E-MAIL E SENHA VÁLIDOS COM A RESPOSTA DA API SEGURA NO AR E VALIDA QUE O AVISO JÁ SUMIU;
      LIBERA A RESPOSTA E VALIDA A ENTRADA NO PAINEL COM A SESSÃO GRAVADA`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { mensagem, sessaoForjada } = dados;
    const { empresa } = await empresaFlows.criarEmpresaIsolada();
    await loginFlows.abrirLoginComSessao(sessaoForjada);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarErroFormulario(mensagem.sessaoExpirada);
    const liberarLogin = await helpersPage.segurarRespostaApi('**/api/auth/login', 'POST');
    await loginFlows.tentarLogin(empresa.email, empresa.senha);
    await loginPage.validarErroFormularioAusente();
    await loginPage.validarUrlLogada(env.urlLogin);
    liberarLogin();
    await loginPage.validarUrlLogada(env.urlAutenticada);
    await loginPage.validarSessaoGravada();
  });
});
