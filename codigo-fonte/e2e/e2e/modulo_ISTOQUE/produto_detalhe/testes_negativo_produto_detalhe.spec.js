import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[produto_detalhe_negativo] Testes do detalhe do produto com erro', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0046] Abrir o detalhe de um produto que não existe [produto_detalhe]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE A URL DE UM PRODUTO QUE NÃO EXISTE E VALIDA "Produto não encontrado" COM A DICA
      "Ele pode ter sido desativado. Volte ao estoque e escolha outro."`);
    test.skip(papelAutenticado !== 'administrador');
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const helpersPage = new HelpersPage(page);
    const { mensagem } = dados;
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/nao-existe`);
    await detalheProdutoPage.validarEstadoVazio(mensagem.produtoNaoEncontrado, mensagem.produtoNaoEncontradoDica);
  });
});
