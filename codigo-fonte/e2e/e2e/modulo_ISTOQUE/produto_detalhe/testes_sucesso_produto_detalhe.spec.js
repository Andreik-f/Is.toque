import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_detalhe_sucesso] Testes do detalhe do produto com sucesso', () => {
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

  test('[CT_#0045] Abrir o detalhe de um produto pelo card do estoque [produto_detalhe]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O ESTOQUE, BUSCA PELO NOME E CLICA NO CARD; VALIDA A URL DO PRODUTO, O TÍTULO
      "Detalhes do produto", O NOME E O ESTOQUE MÁXIMO; CLICA EM "← Voltar ao estoque" E VALIDA A VOLTA À LISTA`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, produto, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.clicarCardProduto(nomeProduto);
    await comunsPage.validarUrl(`${env.baseURL}/#produto/${criado.id}`);
    await comunsPage.validarTitulo(titulo.detalheProduto);
    await detalheProdutoPage.validarNomeProduto(nomeProduto);
    await detalheProdutoPage.validarValorDetalheContendo(rotulo.estoqueMaximo, produto.maximoPadrao);
    await detalheProdutoPage.clicarBotaoVoltar(botao.voltarEstoque);
    await comunsPage.validarUrl(env.urlEstoque);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
  });
});
