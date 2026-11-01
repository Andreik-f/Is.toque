import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_cadastro_sucesso] Testes de cadastro de produto com sucesso', () => {
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

  test('[CT_#0027] Cadastrar produto novo [produto_cadastro]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CADASTRA UM PRODUTO PELO MODAL "Novo produto" COM NOME ÚNICO, ESTOQUE MÍNIMO 1 E MÁXIMO 10;
      VALIDA O AVISO "Produto cadastrado com saldo inicial zero.", O PRODUTO NA LISTA DO ESTOQUE
      E, PELA API, O PRODUTO ATIVO COM SALDO ZERO E OS LIMITES INFORMADOS`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await comunsPage.validarMensagemToast(mensagem.produtoCadastrado);
    await produtoModalPage.validarModalFechado(titulo.novoProduto);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoVisivel(nomeProduto);
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const [produtoGravado] = await produtoFlows.buscarProdutoPorNomePelaApi(sessao, nomeProduto);
    expect(produtoGravado.ativo).toBe(true);
    expect(Number(produtoGravado.quantidadeAtual)).toBe(0);
    expect(Number(produtoGravado.estoqueMinimo)).toBe(Number(produto.minimoPadrao));
    expect(Number(produtoGravado.estoqueMaximo)).toBe(Number(produto.maximoPadrao));
  });

  test('[CT_#0031] Cadastrar produto com foto válida [produto_cadastro]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ANEXA UMA IMAGEM PNG VÁLIDA NO MODAL "Novo produto" E VALIDA QUE O BOTÃO VIRA "Substituir foto" E APARECE "Remover foto";
      SALVA O PRODUTO E VALIDA O AVISO COM A OBSERVAÇÃO DE QUE A FOTO FICA SÓ NA PÁGINA`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const comunsPage = new ComunsPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico('Produto com foto');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.validarBotaoModalVisivel(botao.adicionarFoto);
    await produtoModalPage.anexarFoto(campo.fotoProduto, 'fixtures/imagem-valida.png');
    await produtoModalPage.validarBotaoModalVisivel(botao.substituirFoto);
    await produtoModalPage.validarBotaoModalVisivel(botao.removerFoto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await comunsPage.validarMensagemToast(mensagem.produtoCadastradoComFoto);
    await produtoModalPage.validarModalFechado(titulo.novoProduto);
  });
});
