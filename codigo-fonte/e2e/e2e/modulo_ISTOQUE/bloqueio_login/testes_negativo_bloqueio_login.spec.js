import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[bloqueio_login_negativo] Testes de bloqueio de login e de sessão após troca de senha', () => {
  test('[CT_#0057] Cinco senhas erradas bloqueiam o login, mesmo com a senha certa [bloqueio_login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ERRA A SENHA 5 VEZES SEGUIDAS NA TELA DE LOGIN E VALIDA "E-mail ou senha incorretos." EM CADA TENTATIVA;
      NA 6ª TENTATIVA USA A SENHA CERTA E VALIDA "Muitas tentativas. Tente novamente mais tarde.",
      PERMANECENDO NO LOGIN E SEM SESSÃO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { login, mensagem } = dados;
    const { empresa } = await empresaFlows.criarEmpresaIsolada();
    await loginPage.abrirURL(env.urlLogin);
    helpersPage.iniciarMonitoramentoApi();
    for (let tentativa = 1; tentativa <= login.limiteTentativasFalhas; tentativa++) {
      await loginFlows.tentarLogin(empresa.email, login.senhaErrada);
      await helpersPage.aguardarQuantidadeChamadasApi('POST', '/api/auth/login', tentativa);
      await loginPage.validarErroFormulario(mensagem.credenciaisInvalidas);
    }
    await loginFlows.tentarLogin(empresa.email, empresa.senha);
    await helpersPage.aguardarQuantidadeChamadasApi('POST', '/api/auth/login', login.limiteTentativasFalhas + 1);
    await loginPage.validarErroFormulario(mensagem.contaBloqueada);
    await loginPage.validarQuantidadeErroFormulario(1);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarSessaoAusente();
  });

  test('[CT_#0058] Trocar a senha encerra a sessão que já estava aberta [bloqueio_login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE O PAINEL COM A SESSÃO DE UMA EMPRESA NOVA, TROCA A SENHA DESSE USUÁRIO PELA API E RECARREGA A PÁGINA;
      VALIDA A VOLTA PARA O LOGIN COM "Sua sessão expirou. Entre novamente." UMA ÚNICA VEZ, 401 EM TODAS AS CHAMADAS À API
      E SESSÃO APAGADA; DEPOIS VALIDA QUE A SENHA ANTIGA NÃO ENTRA MAIS`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { login, mensagem, titulo } = dados;
    const { empresa, sessao } = await empresaFlows.criarEmpresaIsolada();
    await loginFlows.abrirLoginComSessao(sessao);
    await comunsPage.validarTitulo(titulo.painel);
    await helpersPage.aguardarRedeOciosa();
    await empresaFlows.trocarSenhaPelaApi(sessao, empresa.senha, login.novaSenha);
    helpersPage.iniciarMonitoramentoApi();
    helpersPage.zerarChamadasApi();
    await helpersPage.recarregarPagina();
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarErroFormulario(mensagem.sessaoExpirada);
    await loginPage.validarQuantidadeErroFormulario(1);
    helpersPage.validarTodasChamadasApiComStatus(401);
    await loginPage.validarSessaoAusente();
    await loginFlows.tentarLogin(empresa.email, empresa.senha);
    await loginPage.validarErroFormulario(mensagem.credenciaisInvalidas);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarSessaoAusente();
  });
});
