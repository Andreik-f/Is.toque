import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[categoria_sucesso] Testes de categoria com sucesso', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    await estoquePage.abrirURL(env.urlEstoque);
  });

  test.afterEach(async ({ page, papelAutenticado }, testInfo) => {
    test.skip(papelAutenticado !== 'administrador');
    const produtoFlows = new ProdutoFlows(page);
    const { email, senha, nomes } = testInfo['massaProduto'] || { nomes: [] };
    if (nomes.length) {
      await produtoFlows.desativarProdutosPorNome(email, senha, nomes);
    }
  });

  test('[CT_#0036] Criar categoria nova no cadastro de produto [categoria]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NO MODAL "Novo produto", ESCOLHE "+ Nova categoria", INFORMA UM NOME ÚNICO E SALVA O PRODUTO;
      VALIDA O AVISO DE CADASTRO, A ABA DA NOVA CATEGORIA NO ESTOQUE E, PELA API, A CATEGORIA CADASTRADA`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    const nomeCategoria = produtoFlows.gerarNomeUnico('Categoria');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.selecionarOpcao(campo.categoria, rotulo.novaCategoriaOpcao);
    await produtoModalPage.preencherCampo(campo.novaCategoria, nomeCategoria);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await comunsPage.validarMensagemToast(mensagem.produtoCadastrado);
    await estoquePage.validarAbaCategoriaVisivel(nomeCategoria);
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const categorias = await produtoFlows.listarCategoriasPelaApi(sessao);
    expect(categorias.filter(categoria => categoria.nome === nomeCategoria)).toHaveLength(1);
  });
});
