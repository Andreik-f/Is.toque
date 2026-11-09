import { test, expect } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import TelefoneEmpresaPage from '../../../support/pages/modulo_ISTOQUE/TelefoneEmpresaPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[telefone_empresa_sucesso] Testes do telefone da empresa com sucesso', () => {
  test('[CT_#0061] Cadastro com telefone aplica a máscara e grava o número sem confirmação [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PREENCHE O CADASTRO COM UM CELULAR SÓ COM DÍGITOS, VALIDA A MÁSCARA E, DEPOIS DE ENVIAR, CONFERE NA API
      QUE O TELEFONE FOI GRAVADO EM E.164 E AINDA NÃO ESTÁ CONFIRMADO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const { botao, campo, telefoneEmpresa } = dados;
    const empresa = empresaFlows.gerarDadosEmpresaUnica();
    const telefone = empresaFlows.gerarTelefoneCelular();
    empresaFlows.registrarEmpresaParaLimpeza(empresa);
    await loginPage.abrirURL(env.urlCadastro);
    await loginPage.preencherCampo(campo.razaoSocial, empresa.razaoSocial);
    await loginPage.preencherCampo(campo.cnpj, empresa.cnpj);
    await loginPage.preencherCampo(telefoneEmpresa.campoCadastro, telefone.digitos);
    await loginPage.validarValorCampo(telefoneEmpresa.campoCadastro, telefone.mascarado);
    await loginPage.preencherCampo(campo.nomeResponsavel, empresa.nome);
    await loginPage.preencherCampo(campo.email, empresa.email);
    await loginPage.preencherCampo(campo.senha, empresa.senha);
    await loginPage.preencherCampo(campo.confirmacaoSenha, empresa.senha);
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarUrlLogada(env.urlAutenticada);
    const gravada = await empresaFlows.lerEmpresaPelaApi(await loginPage.validarSessaoGravada());
    expect(gravada.telefone).toBe(telefone.e164);
    expect(gravada.telefoneVerificadoEm).toBeNull();
  });

  test('[CT_#0062] Enviar código mostra o campo do código e a contagem de 60 segundos [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE "Configurações" DE UMA EMPRESA COM CELULAR, VALIDA "Não confirmado" E CLICA EM "Enviar código";
      VALIDA O CAMPO DO CÓDIGO E O BOTÃO DESABILITADO COM A CONTAGEM REGRESSIVA DE ATÉ 60 SEGUNDOS`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const telefonePage = new TelefoneEmpresaPage(nao_autenticado);
    const { telefoneEmpresa } = dados;
    const { sessao, telefone } = await empresaFlows.criarEmpresaIsoladaComTelefone();
    await loginFlows.abrirLoginComSessao(sessao);
    await telefonePage.abrirConfiguracoesPeloMenu(telefoneEmpresa.linkConfiguracoes);
    await telefonePage.validarSelo(telefoneEmpresa.naoConfirmado);
    await telefonePage.validarValorTelefone(telefone.mascarado);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoEnviarCodigo);
    await telefonePage.validarCampoCodigoVisivel();
    const segundos = await telefonePage.validarContagemDoReenvio();
    expect(segundos).toBeGreaterThan(0);
    expect(segundos).toBeLessThanOrEqual(60);
  });

  test('[CT_#0063] Código certo passa a situação para Confirmado [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO PELA TELA E CONFIRMA UM CÓDIGO DE 6 DÍGITOS COM A CONFIRMAÇÃO SIMULADA (O CÓDIGO REAL SÓ EXISTE
      NO LOG DO BACK); VALIDA "Confirmado" E O FIM DO PEDIDO DE CÓDIGO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const telefonePage = new TelefoneEmpresaPage(nao_autenticado);
    const { telefoneEmpresa } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsoladaComTelefone();
    await loginFlows.abrirLoginComSessao(sessao);
    await telefonePage.abrirConfiguracoesPeloMenu(telefoneEmpresa.linkConfiguracoes);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoEnviarCodigo);
    await telefonePage.simularConfirmacaoDoCodigo();
    await telefonePage.preencherCodigo(telefoneEmpresa.codigoQualquer);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoConfirmar);
    await telefonePage.validarSelo(telefoneEmpresa.confirmado);
    await telefonePage.validarCampoCodigoAusente();
  });

  test('[CT_#0064] Trocar o telefone confirmado avisa e volta para Não confirmado [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE "Configurações" COM A EMPRESA JÁ CONFIRMADA (LEITURA SIMULADA), DIGITA OUTRO CELULAR E VALIDA O AVISO DE
      QUE SERÁ PRECISO CONFIRMAR DE NOVO; SALVA E VALIDA "Não confirmado" E O NÚMERO NOVO NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const telefonePage = new TelefoneEmpresaPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const { telefoneEmpresa } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsoladaComTelefone();
    const novo = empresaFlows.gerarTelefoneCelular();
    await loginFlows.abrirLoginComSessao(sessao);
    await telefonePage.simularEmpresaComTelefoneConfirmado();
    await telefonePage.abrirConfiguracoesPeloMenu(telefoneEmpresa.linkConfiguracoes);
    await telefonePage.validarSelo(telefoneEmpresa.confirmado);
    await telefonePage.preencherTelefone(novo.digitos);
    await telefonePage.validarDicaTelefone(telefoneEmpresa.avisoTroca);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoSalvar);
    await comunsPage.validarMensagemToast(telefoneEmpresa.telefoneSalvo);
    await telefonePage.validarSelo(telefoneEmpresa.naoConfirmado);
    const gravada = await empresaFlows.lerEmpresaPelaApi(sessao);
    expect(gravada.telefone).toBe(novo.e164);
    expect(gravada.telefoneVerificadoEm).toBeNull();
  });
});
