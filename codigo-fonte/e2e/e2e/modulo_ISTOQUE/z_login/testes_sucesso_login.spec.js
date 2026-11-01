import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[login_sucesso] Testes de login com sucesso', () => {
  test('[CT_#0001] Login com credenciais válidas entra no painel [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UMA EMPRESA ISOLADA PELA API, ENTRA PELA TELA DE LOGIN COM E-MAIL E SENHA VÁLIDOS
      E VALIDA A URL DO PAINEL, O SELO "Conectado ao servidor", O NOME DA EMPRESA NO MENU E A SESSÃO GRAVADA`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const { botao, campo, selo, titulo } = dados;
    const { empresa, sessao } = await empresaFlows.criarEmpresaIsolada();
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.preencherCampo(campo.email, empresa.email);
    await loginPage.preencherCampo(campo.senha, empresa.senha);
    await loginPage.clicarBotaoEnvio(botao.entrar);
    await loginPage.validarUrlLogada(env.urlAutenticada);
    await comunsPage.validarTitulo(titulo.painel);
    await comunsPage.validarTextoTopbar(selo.conectado);
    await comunsPage.validarNomeEmpresaMenu(sessao.nomeEmpresa);
    await loginPage.validarSessaoGravada();
    await loginPage.validarErroFormularioAusente();
  });

  test('[CT_#0007] Mostrar e ocultar a senha no login [login]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      DIGITA UMA SENHA NA TELA DE LOGIN, CLICA EM "Mostrar: senha" E VALIDA QUE O CAMPO PASSA A SER TEXTO;
      CLICA EM "Ocultar: senha" E VALIDA QUE O CAMPO VOLTA A SER SENHA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const { botao, campo, login } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.preencherCampo(campo.senha, login.senhaQualquer);
    await loginPage.validarTipoCampo(campo.senha, 'password');
    await loginPage.clicarMostrarOcultarSenha(botao.mostrarSenha);
    await loginPage.validarTipoCampo(campo.senha, 'text');
    await loginPage.validarEstadoMostrarSenha(botao.ocultarSenha, 'true');
    await loginPage.clicarMostrarOcultarSenha(botao.ocultarSenha);
    await loginPage.validarTipoCampo(campo.senha, 'password');
    await loginPage.validarEstadoMostrarSenha(botao.mostrarSenha, 'false');
  });
});
