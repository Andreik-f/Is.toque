import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import RecuperarAcessoPage from '../../../support/pages/modulo_ISTOQUE/RecuperarAcessoPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[recuperar_acesso_negativo] Testes de recuperação de acesso com erro', () => {
  test('[CT_#0026] Pedir o código sem informar o e-mail [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE "Recuperar acesso" E CLICA EM "Enviar código" SEM INFORMAR O E-MAIL;
      VALIDA "Informe seu e-mail.", QUE O MODAL CONTINUA NO PASSO DO E-MAIL E QUE NENHUMA CHAMADA À API FOI FEITA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { campo, mensagem, recuperacao, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoEnviarCodigo);
    await recuperarAcessoPage.validarErroCampo(campo.emailRecuperacao, mensagem.informeEmail);
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.validarAvisoModalAusente();
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0068] Nova senha curta e confirmação diferente são recusadas antes de enviar [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO, INFORMA UMA SENHA DE 7 CARACTERES E UMA CONFIRMAÇÃO DIFERENTE E CLICA EM "Salvar nova senha";
      VALIDA "A senha deve ter no mínimo 8 caracteres." E "As senhas precisam ser iguais.",
      SEM NENHUMA CHAMADA À API DEPOIS DO PEDIDO DO CÓDIGO`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { campo, mensagem, recuperacao } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.preencherCampo(campo.emailRecuperacao, recuperacao.email);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoEnviarCodigo);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoCodigo, recuperacao.codigoQualquer);
    helpersPage.iniciarMonitoramentoApi();
    await recuperarAcessoPage.preencherCampo(recuperacao.campoNovaSenha, recuperacao.senhaCurta);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoConfirmacao, recuperacao.confirmacaoDiferente);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoSalvar);
    await recuperarAcessoPage.validarErroCampo(recuperacao.campoNovaSenha, mensagem.senhaMinima);
    await recuperarAcessoPage.validarErroCampo(recuperacao.campoConfirmacao, mensagem.senhasDiferentes);
    helpersPage.validarNenhumaChamadaApi();
  });

  test('[CT_#0069] Código errado mostra a mensagem genérica e limpa o campo [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO, INFORMA 000000 E UMA NOVA SENHA VÁLIDA E CLICA EM "Salvar nova senha"; O BACK RESPONDE 400
      E A TELA MOSTRA "Código inválido ou vencido." (SEM DIZER QUAL DOS DOIS), COM O CAMPO DO CÓDIGO VAZIO`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const { campo, recuperacao, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.preencherCampo(campo.emailRecuperacao, recuperacao.email);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoEnviarCodigo);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoCodigo, recuperacao.codigoErrado);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoNovaSenha, recuperacao.novaSenha);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoConfirmacao, recuperacao.novaSenha);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoSalvar);
    await recuperarAcessoPage.validarErroCampo(recuperacao.campoCodigo, recuperacao.codigoInvalido);
    await recuperarAcessoPage.validarValorCampo(recuperacao.campoCodigo, '');
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
  });
});
