import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[unidades_medida_negativo] Testes de unidades de medida com erro', () => {
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

  test('[CT_#0040] Unidade de controle não pode ser trocada na edição do produto [unidades_medida]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O MODAL "Editar produto" E VALIDA QUE O CAMPO "Unidade de controle" ESTÁ DESABILITADO
      COM A DICA "Unidade preservada para manter o histórico."`);
    test.skip(papelAutenticado !== 'administrador');
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, mensagem, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${criado.id}`);
    await detalheProdutoPage.clicarBotaoDetalhe(botao.editarProduto);
    await produtoModalPage.validarModalVisivel(titulo.editarProduto);
    await produtoModalPage.validarCampoDesabilitado(campo.unidade);
    await produtoModalPage.validarDicaCampo(rotulo.unidadeControle, mensagem.unidadePreservada);
  });
});
