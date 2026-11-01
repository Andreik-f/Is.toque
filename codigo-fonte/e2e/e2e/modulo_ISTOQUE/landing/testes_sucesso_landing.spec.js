import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LandingPage from '../../../support/pages/modulo_ISTOQUE/LandingPage.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[landing_sucesso] Testes da página inicial com sucesso', () => {
  test('[CT_#0021] Botões da página inicial levam ao cadastro e ao login [landing]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE A PÁGINA INICIAL SEM SESSÃO E VALIDA O TÍTULO PRINCIPAL; CLICA EM "Criar conta da empresa" E VALIDA O FORMULÁRIO DE CADASTRO;
      VOLTA À PÁGINA INICIAL, CLICA EM "Entrar" NO CABEÇALHO E VALIDA O FORMULÁRIO DE LOGIN, SEM NENHUMA CHAMADA À API`);
    test.skip(papelAutenticado !== 'administrador');
    const landingPage = new LandingPage(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, formulario, titulo } = dados;
    helpersPage.iniciarMonitoramentoApi();
    await landingPage.abrirURL(env.baseURL);
    await landingPage.validarTituloHero(titulo.landingHero);
    await landingPage.clicarBotaoHero(botao.criarContaEmpresa);
    await loginPage.validarUrlLogada(env.urlCadastro);
    await loginPage.validarFormularioVisivel(formulario.cadastro);
    await landingPage.abrirURL(env.baseURL);
    await landingPage.validarTituloHero(titulo.landingHero);
    await landingPage.clicarLinkCabecalho(botao.entrar);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarFormularioVisivel(formulario.login);
    helpersPage.validarNenhumaChamadaApi();
  });
});
