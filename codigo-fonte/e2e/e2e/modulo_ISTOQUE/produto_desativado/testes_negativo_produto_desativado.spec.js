import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import DetalheProdutoPage from '../../../support/pages/modulo_ISTOQUE/DetalheProdutoPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[produto_desativado_negativo] Testes de isolamento de produtos entre empresas', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test.afterEach(async ({ page, papelAutenticado }, testInfo) => {
    test.skip(papelAutenticado !== 'administrador');
    const produtoFlows = new ProdutoFlows(page);
    const { email, senha, nomes } = testInfo['massaProdutoOutraEmpresa'] || { nomes: [] };
    if (nomes.length) {
      await produtoFlows.desativarProdutosPorNome(email, senha, nomes);
    }
  });

  test('[CT_#0048] Produto de outra empresa não aparece nem abre [produto_desativado]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UMA SEGUNDA EMPRESA PELA API COM UM PRODUTO; ESTANDO LOGADO NA EMPRESA DA SUÍTE, BUSCA O PRODUTO NO ESTOQUE
      E ABRE A URL DELE; VALIDA QUE O CARD NÃO APARECE E QUE O DETALHE MOSTRA "Produto não encontrado"`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const detalheProdutoPage = new DetalheProdutoPage(page);
    const helpersPage = new HelpersPage(page);
    const empresaFlows = new EmpresaFlows(page);
    const produtoFlows = new ProdutoFlows(page);
    const { campo, mensagem } = dados;
    const nomeProduto = produtoFlows.gerarNomeUnico('Produto de outra empresa');
    const { empresa, sessao } = await empresaFlows.criarEmpresaIsolada();
    testInfo['massaProdutoOutraEmpresa'] = { email: empresa.email, senha: empresa.senha, nomes: [nomeProduto] };
    const criado = await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlEstoque);
    await estoquePage.buscarIngrediente(campo.buscarIngrediente, nomeProduto);
    await estoquePage.validarCardProdutoAusente(nomeProduto);
    await helpersPage.abrirURLERecarregar(`${env.baseURL}/#produto/${criado.id}`);
    await detalheProdutoPage.validarEstadoVazio(mensagem.produtoNaoEncontrado, mensagem.produtoNaoEncontradoDica);
  });
});
