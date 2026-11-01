import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import ReposicaoPage from '../../../support/pages/modulo_ISTOQUE/ReposicaoPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[reposicao_sucesso] Testes de reposição com sucesso', () => {
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

  test('[CT_#0053] Produto no mínimo entra na lista de reposição [reposicao]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API COM MÍNIMO 1, MÁXIMO 10 E SALDO ZERO E ABRE A REPOSIÇÃO; VALIDA A LINHA DO PRODUTO COM MÍNIMO "1 kg"
      E SUGESTÃO DE COMPRA "10 kg"; CLICA EM "Registrar entrada" E VALIDA O MODAL "Movimentar estoque"`);
    test.skip(papelAutenticado !== 'administrador');
    const reposicaoPage = new ReposicaoPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, coluna, reposicao, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlReposicao);
    await comunsPage.validarTitulo(titulo.reposicao);
    await reposicaoPage.validarLinhaProdutoVisivel(nomeProduto);
    await reposicaoPage.validarCelulaLinha(nomeProduto, coluna.minimo, reposicao.minimoEsperado);
    await reposicaoPage.validarCelulaLinha(nomeProduto, coluna.sugestaoCompra, reposicao.sugestaoEsperada);
    await reposicaoPage.clicarBotaoLinha(nomeProduto, botao.registrarEntrada);
    await reposicaoPage.validarModalVisivel(titulo.movimentarEstoque);
  });
});
