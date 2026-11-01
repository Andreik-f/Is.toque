import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import NaoEncontradaPage from '../../../support/pages/modulo_ISTOQUE/NaoEncontradaPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[pagina_404_sucesso] Testes dos botões da página 404', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const naoEncontradaPage = new NaoEncontradaPage(page);
    await naoEncontradaPage.abrirURL(`${env.baseURL}/#${dados.naoEncontrada.hashInexistente}`);
    await naoEncontradaPage.validarTitulo(dados.titulo.naoEncontrada);
  });

  test('[CT_#0024] Botões da página 404 levam de volta ao sistema [pagina_404]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NA PÁGINA 404, CLICA EM "Voltar à visão geral" E VALIDA O PAINEL; ABRE O ENDEREÇO INVÁLIDO DE NOVO,
      CLICA EM "Ir para o estoque" E VALIDA A TELA DE ESTOQUE`);
    test.skip(papelAutenticado !== 'administrador');
    const naoEncontradaPage = new NaoEncontradaPage(page);
    const comunsPage = new ComunsPage(page);
    const { botao, menu, naoEncontrada, rota, titulo } = dados;
    await naoEncontradaPage.clicarBotao(botao.voltarVisaoGeral);
    await comunsPage.validarUrl(`${env.baseURL}/#${rota.dashboard}`);
    await comunsPage.validarTitulo(titulo.painel);
    await naoEncontradaPage.abrirURL(`${env.baseURL}/#${naoEncontrada.hashInexistente}`);
    await naoEncontradaPage.clicarBotao(botao.irParaEstoque);
    await comunsPage.validarUrl(`${env.baseURL}/#${rota.estoque}`);
    await comunsPage.validarTitulo(menu.estoque);
    await naoEncontradaPage.validarPaginaAusente();
  });
});
