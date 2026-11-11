import { test, expect } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import RecuperarAcessoPage from '../../../support/pages/modulo_ISTOQUE/RecuperarAcessoPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[recuperar_acesso_sucesso] Testes de recuperação de acesso com sucesso', () => {
  test('[CT_#0025] Pedir o código mostra a mensagem genérica e a contagem do reenvio [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NA TELA DE LOGIN, CLICA EM "Esqueci minha senha", INFORMA UM E-MAIL SEM CONTA E CLICA EM "Enviar código";
      VALIDA A MENSAGEM GENÉRICA (A MESMA EXISTA OU NÃO A CONTA), OS CAMPOS DO CÓDIGO E DA NOVA SENHA
      E O BOTÃO DE REENVIO DESABILITADO COM A CONTAGEM DE ATÉ 60 SEGUNDOS`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const { campo, recuperacao, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.preencherCampo(campo.emailRecuperacao, recuperacao.email);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoEnviarCodigo);
    await recuperarAcessoPage.validarAvisoModal(recuperacao.aviso);
    await recuperarAcessoPage.validarCampoVisivel(recuperacao.campoCodigo);
    await recuperarAcessoPage.validarCampoVisivel(recuperacao.campoNovaSenha);
    await recuperarAcessoPage.validarCampoVisivel(recuperacao.campoConfirmacao);
    const segundos = await recuperarAcessoPage.validarContagemDoReenvio(recuperacao.inicioBotaoContagem);
    expect(segundos).toBeGreaterThan(0);
    expect(segundos).toBeLessThanOrEqual(60);
  });

  test('[CT_#0067] Senha trocada mostra a confirmação e volta para o login [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO, INFORMA UM CÓDIGO DE 6 DÍGITOS E A NOVA SENHA COM A TROCA SIMULADA (O CÓDIGO REAL SÓ EXISTE
      NO LOG DO BACK); VALIDA "Senha alterada. Entre com a nova senha." E, AO CLICAR EM "Voltar ao login",
      O MODAL FECHADO NA TELA DE LOGIN`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const { campo, formulario, recuperacao, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await recuperarAcessoPage.simularSenhaTrocada();
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.preencherCampo(campo.emailRecuperacao, recuperacao.email);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoEnviarCodigo);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoCodigo, recuperacao.codigoQualquer);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoNovaSenha, recuperacao.novaSenha);
    await recuperarAcessoPage.preencherCampo(recuperacao.campoConfirmacao, recuperacao.novaSenha);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoSalvar);
    await recuperarAcessoPage.validarAvisoModal(recuperacao.senhaAlterada);
    await recuperarAcessoPage.clicarBotaoModal(recuperacao.botaoVoltarLogin);
    await recuperarAcessoPage.validarModalFechado(titulo.recuperarAcesso);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarFormularioVisivel(formulario.login);
  });
});
