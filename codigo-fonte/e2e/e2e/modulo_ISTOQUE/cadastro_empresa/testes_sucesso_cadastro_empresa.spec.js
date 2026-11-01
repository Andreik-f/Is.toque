import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import LogoutFlows from '../../../support/flows/LogoutFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[cadastro_empresa_sucesso] Testes de cadastro de empresa com sucesso', () => {
  test('[CT_#0008] Cadastro cria a empresa e já entra no painel [cadastro_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PREENCHE O FORMULÁRIO "Cadastro básico" COM DADOS ÚNICOS E CLICA EM "Criar conta"; VALIDA O PAINEL, A SESSÃO GRAVADA
      E QUE AS CHAMADAS SEGUINTES À API SAEM COM O TOKEN; DEPOIS SAI E ENTRA DE NOVO COM AS MESMAS CREDENCIAIS
      PARA CONFIRMAR QUE A EMPRESA FOI GRAVADA`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const logoutFlows = new LogoutFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, campo, selo, titulo } = dados;
    const empresa = empresaFlows.gerarDadosEmpresaUnica();
    empresaFlows.registrarEmpresaParaLimpeza(empresa);
    await loginPage.abrirURL(env.urlCadastro);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.preencherCampo(campo.razaoSocial, empresa.razaoSocial);
    await loginPage.preencherCampo(campo.cnpj, empresa.cnpj);
    await loginPage.preencherCampo(campo.nomeResponsavel, empresa.nome);
    await loginPage.preencherCampo(campo.email, empresa.email);
    await loginPage.preencherCampo(campo.senha, empresa.senha);
    await loginPage.preencherCampo(campo.confirmacaoSenha, empresa.senha);
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarUrlLogada(env.urlAutenticada);
    await comunsPage.validarTitulo(titulo.painel);
    await comunsPage.validarTextoTopbar(selo.conectado);
    const sessao = await loginPage.validarSessaoGravada();
    await helpersPage.aguardarQuantidadeMinimaChamadasApi(2);
    helpersPage.validarChamadasApiComAutorizacao(sessao.token, ['/api/auth/']);
    await logoutFlows.realizarLogout();
    await loginFlows.realizarLogin(empresa.email, empresa.senha);
    await comunsPage.validarNomeEmpresaMenu(empresa.razaoSocial);
  });
});
