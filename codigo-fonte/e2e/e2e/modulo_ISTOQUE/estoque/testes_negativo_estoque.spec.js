import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[estoque_negativo] Testes da tela de estoque com erro', () => {
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

  test('[CT_#0042] Buscar produto que não existe no estoque [estoque]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O ESTOQUE E BUSCA UM TEXTO QUE NÃO EXISTE; VALIDA "Nenhum resultado" E A DICA DA TELA;
      CLICA EM "Limpar filtros" E VALIDA QUE A BUSCA FICA VAZIA E O PRODUTO VOLTA À LISTA`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, `${nomeProduto} ${produto.buscaSemResultado}`);
    await estoquePage.validarEstadoVazio(mensagem.nenhumResultado, mensagem.nenhumResultadoDica);
    await estoquePage.clicarBotao(botao.limparFiltros);
    await estoquePage.validarCampoBuscaVazio(campo.buscarIngrediente);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
  });
});
