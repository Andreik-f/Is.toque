import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[bloqueio_login_sucesso] Testes de troca de senha com sucesso', () => {
  test('[CT_#0059] Depois de trocar a senha, o login com a senha nova entra no painel [bloqueio_login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      TROCA A SENHA DE UMA EMPRESA NOVA PELA API, ENTRA PELA TELA DE LOGIN COM A SENHA NOVA
      E VALIDA A URL DO PAINEL, O TÍTULO DO PAINEL E A SESSÃO GRAVADA, SEM MENSAGEM DE ERRO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const { login, titulo } = dados;
    const { empresa, sessao } = await empresaFlows.criarEmpresaIsolada();
    await empresaFlows.trocarSenhaPelaApi(sessao, empresa.senha, login.novaSenha);
    await loginFlows.realizarLogin(empresa.email, login.novaSenha);
    await loginPage.validarUrlLogada(env.urlAutenticada);
    await comunsPage.validarTitulo(titulo.painel);
    await loginPage.validarSessaoGravada();
    await loginPage.validarErroFormularioAusente();
  });
});
