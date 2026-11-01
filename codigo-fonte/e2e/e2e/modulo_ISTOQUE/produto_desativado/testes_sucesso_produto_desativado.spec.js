import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_desativado_sucesso] Testes de produto desativado com sucesso', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test.afterEach(async ({ page, papelAutenticado }, testInfo) => {
    test.skip(papelAutenticado !== 'administrador');
    const produtoFlows = new ProdutoFlows(page);
    const { email, senha, nomes } = testInfo['massaProduto'] || { nomes: [] };
    if (nomes.length) {
      await produtoFlows.desativarProdutosPorNome(email, senha, nomes);
    }
  });

  test('[CT_#0047] Produto desativado some do estoque e do detalhe [produto_desativado]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API E VALIDA O CARD NO ESTOQUE; DESATIVA O PRODUTO PELA API (A TELA NÃO TEM ESSA AÇÃO) E RECARREGA;
      VALIDA QUE O CARD SUMIU E QUE A URL DO PRODUTO MOSTRA "Produto não encontrado"`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { campo, mensagem } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    await produtoFlows.desativarProdutoPelaApi(sessao, criado.id);
    await helpersPage.recarregarPagina();
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoAusente(nomeProduto);
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${criado.id}`);
    await detalheProdutoPage.validarEstadoVazio(mensagem.produtoNaoEncontrado, mensagem.produtoNaoEncontradoDica);
  });
});
