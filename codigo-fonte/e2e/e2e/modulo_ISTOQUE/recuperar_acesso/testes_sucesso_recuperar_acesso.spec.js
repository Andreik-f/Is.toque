import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import RecuperarAcessoPage from '../../../support/pages/modulo_ISTOQUE/RecuperarAcessoPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[recuperar_acesso_sucesso] Testes de recuperação de acesso com sucesso', () => {
  test('[CT_#0025] Simular recuperação de acesso [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NA TELA DE LOGIN, CLICA EM "Esqueceu a senha?", INFORMA UM E-MAIL E CLICA EM "Simular recuperação";
      VALIDA "Simulação concluída. Nenhum e-mail foi enviado." E QUE NENHUMA CHAMADA À API FOI FEITA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { botao, campo, mensagem, recuperacao, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    helpersPage.iniciarMonitoramentoApi();
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.preencherEmail(campo.emailRecuperacao, recuperacao.email);
    await recuperarAcessoPage.clicarBotaoModal(botao.simularRecuperacao);
    await recuperarAcessoPage.validarAvisoModal(mensagem.simulacaoRecuperacao);
    helpersPage.validarNenhumaChamadaApi();
  });
});
