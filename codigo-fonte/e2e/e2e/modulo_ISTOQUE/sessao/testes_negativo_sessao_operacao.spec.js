import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[sessao_operacao_negativo] Testes de sessão que expira durante uma operação', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    await estoquePage.abrirURL(env.urlEstoque);
  });

  test('[CT_#0018] Sessão expirada ao salvar produto volta ao login e não reabre o modal [sessao]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      SIMULA RESPOSTA 401 AO SALVAR UM PRODUTO NO MODAL "Novo produto"; VALIDA A VOLTA PARA O LOGIN COM O AVISO
      "Sua sessão expirou. Entre novamente." UMA ÚNICA VEZ; ENTRA DE NOVO E VALIDA QUE O MODAL NÃO REAPARECE`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const loginPage = new LoginPage(page);
    const loginFlows = new LoginFlows(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { api, botao, campo, mensagem, produto, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    await helpersPage.mockarRespostaApi('**/api/produtos', 'POST', 401, api.produtoSessaoExpirada);
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await loginPage.validarUrlLogada(env.urlLogin);
    await loginPage.validarErroFormulario(mensagem.sessaoExpirada);
    await loginPage.validarQuantidadeErroFormulario(1);
    await loginFlows.realizarLogin(usuario.email, usuario.senha);
    await produtoModalPage.validarModalFechado(titulo.novoProduto);
  });
});
