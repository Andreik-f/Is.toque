import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_cadastro_negativo] Testes de cadastro de produto com erro', () => {
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

  test('[CT_#0028] Salvar produto com o formulário vazio [produto_cadastro]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE "Novo produto" E CLICA EM "Salvar produto" SEM PREENCHER NADA; VALIDA QUE NOME, ESTOQUE MÍNIMO E ESTOQUE MÁXIMO
      SÃO REJEITADOS COMO OBRIGATÓRIOS, QUE O MODAL CONTINUA ABERTO E QUE NADA FOI GRAVADO NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const { botao, campo, titulo } = dados;
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.iniciarMonitoramentoApi();
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await produtoModalPage.validarCampoObrigatorioVazio(campo.nomeProduto);
    await produtoModalPage.validarCampoObrigatorioVazio(campo.estoqueMinimo);
    await produtoModalPage.validarCampoObrigatorioVazio(campo.estoqueMaximo);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.validarNenhumaGravacaoApi();
  });

  test('[CT_#0029] Salvar produto com estoque máximo menor que o mínimo [produto_cadastro]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PREENCHE ESTOQUE MÍNIMO 10 E MÁXIMO 1 E CLICA EM "Salvar produto"; VALIDA A MENSAGEM
      "O estoque máximo precisa ser maior ou igual ao mínimo.", O MODAL ABERTO E NENHUMA GRAVAÇÃO NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, titulo } = dados;
    const nomeProduto = produtoFlows.gerarNomeUnico();
    const usuario = obterUsuarioPorPapel('administrador');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.iniciarMonitoramentoApi();
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoInvalido);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoInvalido);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await produtoModalPage.validarErroFormulario(mensagem.estoqueMaximoMenor);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    helpersPage.validarNenhumaGravacaoApi();
  });

  test('[CT_#0030] Salvar produto com nome já cadastrado [produto_cadastro]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CADASTRA UM PRODUTO PELA API E TENTA CADASTRAR OUTRO COM O MESMO NOME PELO MODAL "Novo produto";
      VALIDA A RESPOSTA 409, QUE UM ERRO É EXIBIDO NO MODAL E QUE EXISTE SÓ UM PRODUTO COM ESSE NOME NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, produto, titulo } = dados;
    const nomeProduto = produtoFlows.gerarNomeUnico();
    const usuario = obterUsuarioPorPapel('administrador');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomeProduto);
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoPadrao);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoPadrao);
    const resposta = await produtoModalPage.clicarBotaoModalEAguardarResposta(botao.salvarProduto, 'POST', '/api/produtos');
    expect(resposta.status()).toBe(409);
    await produtoModalPage.validarErroFormularioPreenchido();
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    const produtosComNome = await produtoFlows.buscarProdutoPorNomePelaApi(sessao, nomeProduto);
    expect(produtosComNome).toHaveLength(1);
  });

  test('[CT_#0032] Anexar arquivo que não é imagem como foto do produto [produto_cadastro]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ANEXA UM ARQUIVO DE TEXTO NO CAMPO DE FOTO DO MODAL "Novo produto" E VALIDA A MENSAGEM
      "Formato não aceito. Escolha uma imagem JPG, PNG ou WebP." E QUE A FOTO NÃO FOI ACEITA (O BOTÃO CONTINUA "Adicionar foto")`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const { botao, campo, mensagem, titulo } = dados;
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    await produtoModalPage.anexarFoto(campo.fotoProduto, 'fixtures/arquivo-invalido.txt');
    await produtoModalPage.validarErroFoto(mensagem.formatoImagem);
    await produtoModalPage.validarBotaoModalVisivel(botao.adicionarFoto);
    await produtoModalPage.validarBotaoModalAusente(botao.removerFoto);
  });
});
