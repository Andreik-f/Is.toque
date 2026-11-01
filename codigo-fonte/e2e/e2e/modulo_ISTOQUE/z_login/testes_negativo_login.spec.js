import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[login_negativo] Testes de login com erro', () => {
  test('[CT_#0002] Login com senha errada [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      TENTA ENTRAR COM E-MAIL DE UMA EMPRESA EXISTENTE E SENHA ERRADA E VALIDA A MENSAGEM "E-mail ou senha incorretos.",
      QUE A TELA PERMANECE NO LOGIN, SEM SESSÃO E SEM O AVISO DE SESSÃO EXPIRADA`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const { botao, campo, login, mensagem } = dados;
    const { empresa } = await empresaFlows.criarEmpresaIsolada();
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.preencherCampo(campo.email, empresa.email);
    await loginPage.preencherCampo(campo.senha, login.senhaErrada);
    await loginPage.clicarBotaoEnvio(botao.entrar);
    await loginPage.validarErroFormulario(mensagem.credenciaisInvalidas);
    await loginPage.validarQuantidadeErroFormulario(1);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarSessaoAusente();
  });

  test('[CT_#0003] Entrar sem preencher e-mail e senha [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CLICA EM "Entrar" COM OS CAMPOS VAZIOS E VALIDA "Informe seu e-mail." E "Informe sua senha.",
      SEM NENHUMA CHAMADA À API`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, mensagem, rotulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.clicarBotaoEnvio(botao.entrar);
    await loginPage.validarErroCampo(rotulo.emailUsuario, mensagem.informeEmail);
    await loginPage.validarErroCampo(rotulo.senha, mensagem.informeSenha);
    await loginPage.validarUrlLogada(env.urlLogin);
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0004] Entrar com e-mail em formato inválido [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      INFORMA UM E-MAIL SEM "@" E UMA SENHA E CLICA EM "Entrar"; VALIDA "Digite um e-mail válido."
      E QUE NENHUMA CHAMADA À API FOI FEITA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, campo, login, mensagem, rotulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.preencherCampo(campo.email, login.emailSemArroba);
    await loginPage.preencherCampo(campo.senha, login.senhaQualquer);
    await loginPage.clicarBotaoEnvio(botao.entrar);
    await loginPage.validarErroCampo(rotulo.emailUsuario, mensagem.emailInvalido);
    await loginPage.validarUrlLogada(env.urlLogin);
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0005] Entrar com e-mail que não existe [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      TENTA ENTRAR COM UM E-MAIL ÚNICO QUE NÃO ESTÁ CADASTRADO E VALIDA "E-mail ou senha incorretos.",
      PERMANECENDO NO LOGIN E SEM SESSÃO`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, campo, login, mensagem, cadastro } = dados;
    const emailInexistente = `${helpersPage.gerarCodigoUnico().toLowerCase()}${login.emailInexistenteDominio}`;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.preencherCampo(campo.email, emailInexistente);
    await loginPage.preencherCampo(campo.senha, cadastro.senhaValida);
    await loginPage.clicarBotaoEnvio(botao.entrar);
    await loginPage.validarErroFormulario(mensagem.credenciaisInvalidas);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarSessaoAusente();
  });
});
