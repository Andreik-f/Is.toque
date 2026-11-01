import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[produto_edicao_negativo] Testes de edição de produto com erro', () => {
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

  test('[CT_#0034] Editar produto com mínimo maior que o máximo [produto_edicao]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      EDITA UM PRODUTO COM ESTOQUE MÍNIMO 10 E MÁXIMO 1 E SALVA; VALIDA A MENSAGEM
      "O estoque máximo precisa ser maior ou igual ao mínimo." E QUE OS LIMITES NA API CONTINUAM OS ORIGINAIS`);
    test.skip(papelAutenticado !== 'administrador');
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, produto, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${criado.id}`);
    await detalheProdutoPage.clicarBotaoDetalhe(botao.editarProduto);
    await produtoModalPage.validarModalVisivel(titulo.editarProduto);
    helpersPage.iniciarMonitoramentoApi();
    await produtoModalPage.preencherCampo(campo.estoqueMinimo, produto.minimoInvalido);
    await produtoModalPage.preencherCampo(campo.estoqueMaximo, produto.maximoInvalido);
    await produtoModalPage.clicarBotaoModal(botao.salvarProduto);
    await produtoModalPage.validarErroFormulario(mensagem.estoqueMaximoMenor);
    helpersPage.validarNenhumaGravacaoApi();
    const gravado = await produtoFlows.buscarProdutoPorIdPelaApi(sessao, criado.id);
    expect(Number(gravado.estoqueMinimo)).toBe(Number(produto.minimoPadrao));
    expect(Number(gravado.estoqueMaximo)).toBe(Number(produto.maximoPadrao));
  });

  test('[CT_#0035] Renomear produto para um nome já cadastrado [produto_edicao]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA DOIS PRODUTOS PELA API E RENOMEIA O SEGUNDO COM O NOME DO PRIMEIRO; VALIDA A RESPOSTA 409,
      QUE UM ERRO É EXIBIDO E QUE O NOME DO SEGUNDO NÃO MUDOU NA API`);
    test.skip(papelAutenticado !== 'administrador');
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomePrimeiro = produtoFlows.gerarNomeUnico('Primeiro');
    const nomeSegundo = produtoFlows.gerarNomeUnico('Segundo');
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomePrimeiro, nomeSegundo] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomePrimeiro });
    const segundo = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeSegundo });
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${segundo.id}`);
    await detalheProdutoPage.clicarBotaoDetalhe(botao.editarProduto);
    await produtoModalPage.validarModalVisivel(titulo.editarProduto);
    await produtoModalPage.preencherCampo(campo.nomeProduto, nomePrimeiro);
    const resposta = await produtoModalPage.clicarBotaoModalEAguardarResposta(botao.salvarProduto, 'PUT', `/api/produtos/${segundo.id}`);
    expect(resposta.status()).toBe(409);
    await produtoModalPage.validarErroFormularioPreenchido();
    const gravado = await produtoFlows.buscarProdutoPorIdPelaApi(sessao, segundo.id);
    expect(gravado.nome).toBe(nomeSegundo);
  });
});
