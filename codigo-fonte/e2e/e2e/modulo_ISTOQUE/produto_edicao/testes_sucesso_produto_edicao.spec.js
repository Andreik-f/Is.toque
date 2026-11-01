import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_edicao_sucesso] Testes de edição de produto com sucesso', () => {
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

  test('[CT_#0033] Editar nome e limites de um produto [produto_edicao]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O DETALHE E CLICA EM "Editar produto"; TROCA O NOME E OS LIMITES E SALVA;
      VALIDA O AVISO "Produto atualizado.", O NOVO NOME APÓS RECARREGAR A PÁGINA E, PELA API, OS NOVOS LIMITES`);
    test.skip(papelAutenticado !== 'administrador');
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    const nomeEditado = `${nomeProduto}${produto.sufixoEditado}`;
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto, nomeEditado] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${criado.id}`);
    await detalheProdutoPage.validarNomeProduto(nomeProduto);
    await detalheProdutoPage.clicarBotaoDetalhe(botao.editarProduto);
    await produtoModalPage.validarModalVisivel(titulo.editarProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeEditado);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoEditado);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoEditado);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await comunsPage.validarMensagemToast(mensagem.produtoAtualizado);
    await produtoModalPage.validarModalFechado(titulo.editarProduto);
    await helpersPage.recarregarPagina();
    await detalheProdutoPage.validarNomeProduto(nomeEditado);
    const gravado = await produtoFlows.buscarProdutoPorIdPelaApi(sessao, criado.id);
    expect(gravado.nome).toBe(nomeEditado);
    expect(gravado.ativo).toBe(true);
    expect(Number(gravado.estoqueMinimo)).toBe(Number(produto.minimoEditado));
    expect(Number(gravado.estoqueMaximo)).toBe(Number(produto.maximoEditado));
  });
});
