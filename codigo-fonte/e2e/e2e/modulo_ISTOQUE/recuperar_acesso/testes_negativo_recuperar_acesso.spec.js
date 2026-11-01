import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import RecuperarAcessoPage from '../../../support/pages/modulo_ISTOQUE/RecuperarAcessoPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[recuperar_acesso_negativo] Testes de recuperação de acesso com erro', () => {
  test('[CT_#0026] Simular recuperação sem informar o e-mail [recuperar_acesso]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE "Recuperar acesso" E CLICA EM "Simular recuperação" SEM INFORMAR O E-MAIL;
      VALIDA QUE O CAMPO É REJEITADO COMO OBRIGATÓRIO, QUE O MODAL CONTINUA ABERTO E QUE A SIMULAÇÃO NÃO FOI CONCLUÍDA`);
    test.skip(papelAutenticado !== 'administrador');
    const loginPage = new LoginPage(nao_autenticado);
    const recuperarAcessoPage = new RecuperarAcessoPage(nao_autenticado);
    const { botao, campo, titulo } = dados;
    await loginPage.abrirURL(env.urlLogin);
    await loginPage.clicarLinkEsqueceuSenha();
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.clicarBotaoModal(botao.simularRecuperacao);
    await recuperarAcessoPage.validarEmailObrigatorioVazio(campo.emailRecuperacao);
    await recuperarAcessoPage.validarModalVisivel(titulo.recuperarAcesso);
    await recuperarAcessoPage.validarAvisoModalAusente();
  });
});
