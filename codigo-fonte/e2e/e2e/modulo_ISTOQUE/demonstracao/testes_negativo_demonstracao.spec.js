import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[demonstracao_negativo] Testes do modo demonstração que não persiste', () => {
  test('[CT_#0020] Alterações da demonstração não persistem nem chamam a API [demonstracao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      SEM SESSÃO, CADASTRA UM PRODUTO NA DEMONSTRAÇÃO E VALIDA O CARD; RECARREGA A PÁGINA E VALIDA QUE O PRODUTO SUMIU;
      CLICA EM "Reiniciar demonstração" E VALIDA O AVISO "Demonstração reiniciada.", SEM NENHUMA CHAMADA À API`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(nao_autenticado);
    const produtoModalPage = new ProdutoModalPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const produtoFlows = new ProdutoFlows(nao_autenticado);
    const { botao, campo, mensagem, produto, rota, titulo } = dados;
    const nomeProduto = produtoFlows.gerarNomeUnico('Produto da demonstração');
    helpersPage.iniciarMonitoramentoApi();
    await estoquePage.abrirURL(env.urlEstoque);
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await comunsPage.validarMensagemToast(mensagem.produtoCadastrado);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    await helpersPage.recarregarPagina();
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoAusente(nomeProduto);
    await comunsPage.clicarBotaoMenuLateral(botao.reiniciarDemonstracao);
    await comunsPage.validarMensagemToast(mensagem.demonstracaoReiniciada);
    await comunsPage.validarUrl(`${env.baseURL}/#${rota.dashboard}`);
    helpersPage.validarNenhumaChamadaApi();
  });
});
