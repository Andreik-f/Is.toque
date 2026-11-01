import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[estoque_sucesso] Testes da tela de estoque com sucesso', () => {
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

  test('[CT_#0041] Buscar produto pelo nome no estoque [estoque]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O ESTOQUE E BUSCA PELO NOME ÚNICO; VALIDA QUE O CARD DO PRODUTO APARECE
      E QUE O CONTADOR MOSTRA "1 produto"`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { campo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    await estoquePage.validarContadorResultado('1 produto');
  });

  test('[CT_#0044] Filtrar somente estoque baixo mostra produto sem saldo [estoque]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API COM MÍNIMO 1 E SALDO ZERO, ABRE O ESTOQUE, BUSCA PELO NOME E MARCA "Somente estoque baixo";
      VALIDA QUE O PRODUTO CONTINUA NA LISTA COM O SELO "Sem estoque"`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { campo, rotulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.marcarSomenteEstoqueBaixo();
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    await estoquePage.validarBadgeProduto(nomeProduto, rotulo.badgeSemEstoque);
    await estoquePage.validarContadorResultado('1 produto');
  });
});
