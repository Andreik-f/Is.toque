import { test, expect } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[cadastro_empresa_negativo] Testes de cadastro de empresa com erro', () => {
  test('[CT_#0009] Cadastro sem preencher os campos obrigatórios [cadastro_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CLICA EM "Criar conta" SEM PREENCHER NADA E VALIDA A MENSAGEM DE CADA CAMPO OBRIGATÓRIO,
      A PERMANÊNCIA NO CADASTRO E QUE NENHUMA CHAMADA À API FOI FEITA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, mensagem, rotulo } = dados;
    await loginPage.abrirURL(env.urlCadastro);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarErroCampo(rotulo.razaoSocial, mensagem.informeRazaoSocial);
    await loginPage.validarErroCampo(rotulo.cnpj, mensagem.informeCnpj);
    await loginPage.validarErroCampo(rotulo.nomeResponsavel, mensagem.informeNomeResponsavel);
    await loginPage.validarErroCampo(rotulo.emailUsuario, mensagem.informeEmail);
    await loginPage.validarErroCampo(rotulo.senha, mensagem.informeSenha);
    await loginPage.validarErroCampo(rotulo.confirmarSenha, mensagem.confirmeSenha);
    await loginPage.validarUrlLogada(env.urlCadastro);
    await loginPage.validarSessaoAusente();
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0010] Cadastro com formatos inválidos [cadastro_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PREENCHE CNPJ CURTO, E-MAIL SEM "@", SENHA COM MENOS DE 8 CARACTERES E CONFIRMAÇÃO DIFERENTE E CLICA EM "Criar conta";
      VALIDA AS QUATRO MENSAGENS DE FORMATO E QUE NENHUMA CHAMADA À API FOI FEITA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, campo, cadastro, mensagem, rotulo } = dados;
    await loginPage.abrirURL(env.urlCadastro);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.preencherCampo(campo.razaoSocial, `${helpersPage.gerarCodigoUnico()} Validação`);
    await loginPage.preencherCampo(campo.cnpj, cadastro.cnpjInvalido);
    await loginPage.preencherCampo(campo.nomeResponsavel, cadastro.nomeResponsavelPadrao);
    await loginPage.preencherCampo(campo.email, cadastro.emailSemArroba);
    await loginPage.preencherCampo(campo.senha, cadastro.senhaCurta);
    await loginPage.preencherCampo(campo.confirmacaoSenha, cadastro.confirmacaoDiferente);
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarErroCampo(rotulo.cnpj, mensagem.cnpjFormato);
    await loginPage.validarErroCampo(rotulo.emailUsuario, mensagem.emailInvalido);
    await loginPage.validarErroCampo(rotulo.senha, mensagem.senhaMinima);
    await loginPage.validarErroCampo(rotulo.confirmarSenha, mensagem.senhasDiferentes);
    await loginPage.validarUrlLogada(env.urlCadastro);
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0011] Cadastro com CNPJ já cadastrado [cadastro_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CADASTRA UMA EMPRESA PELA API E TENTA CADASTRAR OUTRA COM O MESMO CNPJ E UM E-MAIL NOVO PELA TELA;
      VALIDA A MENSAGEM DE CNPJ JÁ CADASTRADO, A PERMANÊNCIA NO CADASTRO, A AUSÊNCIA DE SESSÃO
      E QUE O E-MAIL NOVO NÃO FOI GRAVADO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const { botao, campo, mensagem } = dados;
    const { empresa } = await empresaFlows.criarEmpresaIsolada();
    const segundaEmpresa = empresaFlows.gerarDadosEmpresaUnica();
    empresaFlows.registrarEmpresaParaLimpeza(segundaEmpresa);
    await loginPage.abrirURL(env.urlCadastro);
    await loginPage.preencherCampo(campo.razaoSocial, segundaEmpresa.razaoSocial);
    await loginPage.preencherCampo(campo.cnpj, empresa.cnpj);
    await loginPage.preencherCampo(campo.nomeResponsavel, segundaEmpresa.nome);
    await loginPage.preencherCampo(campo.email, segundaEmpresa.email);
    await loginPage.preencherCampo(campo.senha, segundaEmpresa.senha);
    await loginPage.preencherCampo(campo.confirmacaoSenha, segundaEmpresa.senha);
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarErroFormularioContendo(mensagem.cnpjDuplicado);
    await loginPage.validarUrlLogada(env.urlCadastro);
    await loginPage.validarSessaoAusente();
    const sessaoNaoCriada = await empresaFlows.entrarPelaApi(segundaEmpresa.email, segundaEmpresa.senha);
    expect(sessaoNaoCriada).toBeNull();
  });

  test('[CT_#0012] Cadastro com e-mail já cadastrado [cadastro_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CADASTRA UMA EMPRESA PELA API E TENTA CADASTRAR OUTRA COM O MESMO E-MAIL E UM CNPJ NOVO PELA TELA;
      VALIDA A MENSAGEM DE E-MAIL JÁ CADASTRADO, A PERMANÊNCIA NO CADASTRO, A AUSÊNCIA DE SESSÃO
      E QUE O CNPJ NOVO CONTINUA LIVRE (A EMPRESA NÃO FOI CRIADA)`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginPage = new LoginPage(nao_autenticado);
    const { botao, campo, mensagem } = dados;
    const { empresa } = await empresaFlows.criarEmpresaIsolada();
    const segundaEmpresa = empresaFlows.gerarDadosEmpresaUnica();
    await loginPage.abrirURL(env.urlCadastro);
    await loginPage.preencherCampo(campo.razaoSocial, segundaEmpresa.razaoSocial);
    await loginPage.preencherCampo(campo.cnpj, segundaEmpresa.cnpj);
    await loginPage.preencherCampo(campo.nomeResponsavel, segundaEmpresa.nome);
    await loginPage.preencherCampo(campo.email, empresa.email);
    await loginPage.preencherCampo(campo.senha, segundaEmpresa.senha);
    await loginPage.preencherCampo(campo.confirmacaoSenha, segundaEmpresa.senha);
    await loginPage.clicarBotaoEnvio(botao.criarConta);
    await loginPage.validarErroFormularioContendo(mensagem.emailDuplicado);
    await loginPage.validarUrlLogada(env.urlCadastro);
    await loginPage.validarSessaoAusente();
    const empresaComCnpjLivre = { ...segundaEmpresa, email: `livre.${segundaEmpresa.email}` };
    empresaFlows.registrarEmpresaParaLimpeza(empresaComCnpjLivre);
    await empresaFlows.cadastrarEmpresaPelaApi(empresaComCnpjLivre);
  });
});
