import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[categoria_negativo] Testes de categoria com erro', () => {
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

  test('[CT_#0037] Criar categoria nova sem informar o nome [categoria]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NO MODAL "Novo produto", ESCOLHE "+ Nova categoria", NÃO INFORMA O NOME DA CATEGORIA E CLICA EM "Salvar produto";
      VALIDA QUE O CAMPO "Nome da nova categoria" É REJEITADO COMO OBRIGATÓRIO E QUE NADA FOI GRAVADO NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, produto, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.iniciarMonitoramentoApi();
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.selecionarOpcao(campo.categoria, rotulo.novaCategoriaOpcao);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await produtoModalPage.validarCampoObrigatorioVazio(campo.novaCategoria);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.validarNenhumaGravacaoApi();
  });

  test('[CT_#0038] Criar categoria nova com nome já cadastrado [categoria]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CADASTRA UMA CATEGORIA PELA API E TENTA CRIAR OUTRA COM O MESMO NOME PELO MODAL "Novo produto";
      VALIDA A RESPOSTA 409, QUE UM ERRO É EXIBIDO, QUE EXISTE SÓ UMA CATEGORIA COM ESSE NOME E QUE O PRODUTO NÃO FOI CRIADO`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, produto, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    const nomeCategoria = produtoFlows.gerarNomeUnico('Categoria');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarCategoriaPelaApi(sessao, nomeCategoria);
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.selecionarOpcao(campo.categoria, rotulo.novaCategoriaOpcao);
    await produtoModalPage.preencherCampo(campo.novaCategoria, nomeCategoria);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    const resposta = await produtoModalPage.clicarBotaoModalEAguardarResposta(botao.salvarProduto, 'POST', '/api/categorias');
    expect(resposta.status()).toBe(409);
    await produtoModalPage.validarErroFormularioPreenchido();
    const categorias = await produtoFlows.listarCategoriasPelaApi(sessao);
    expect(categorias.filter(categoria => categoria.nome === nomeCategoria)).toHaveLength(1);
    const produtosComNome = await produtoFlows.buscarProdutoPorNomePelaApi(sessao, nomeProduto);
    expect(produtosComNome).toHaveLength(0);
  });
});
