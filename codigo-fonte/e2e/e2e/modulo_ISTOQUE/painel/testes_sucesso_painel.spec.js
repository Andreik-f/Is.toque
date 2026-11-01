import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import PainelPage from '../../../support/pages/modulo_ISTOQUE/PainelPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[painel_sucesso] Testes do painel com sucesso', () => {
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

  test('[CT_#0049] Painel mostra a quantidade de produtos cadastrados na API [painel]', async ({ page, papelAutenticado }, testInfo) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UM PRODUTO PELA API, ABRE O PAINEL E VALIDA QUE O INDICADOR "Produtos cadastrados" É IGUAL À QUANTIDADE DE PRODUTOS ATIVOS
      DEVOLVIDA PELA API, O TÍTULO "Tudo pronto para hoje?" E O RODAPÉ "Produtos e categorias salvos no servidor"`);
    test.skip(papelAutenticado !== 'administrador');
    const painelPage = new PainelPage(page);
    const comunsPage = new ComunsPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { rodape, rotulo, titulo } = dados;
    const usuario = obterUsuarioPorPapel('administrador');
    const nomeProduto = produtoFlows.gerarNomeUnico();
    testInfo['massaProduto'] = { email: usuario.email, senha: usuario.senha, nomes: [nomeProduto] };
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    await produtoFlows.criarProdutoPelaApi(sessao, { nome: nomeProduto });
    await helpersPage.abrirURLERecarregar(env.urlDashboard);
    const ativos = await produtoFlows.listarProdutosAtivosPelaApi(sessao);
    expect(ativos.length).toBeGreaterThan(0);
    await comunsPage.validarTitulo(titulo.painel);
    await painelPage.validarValorIndicador(rotulo.indicadorProdutosCadastrados, String(ativos.length));
    await comunsPage.validarTextoRodape(rodape.servidor);
  });
});
