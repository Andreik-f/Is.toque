import { test, expect } from '../../../fixtures/usuario_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import ProdutoModalPage from '../../../support/pages/modulo_ISTOQUE/ProdutoModalPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import ProdutoFlows from '../../../support/flows/ProdutoFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[unidades_medida_sucesso] Testes de unidades de medida com sucesso', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    await estoquePage.abrirURL(env.urlEstoque);
  });

  test('[CT_#0039] Campo de unidade lista as unidades cadastradas na API [unidades_medida]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE O MODAL "Novo produto" E COMPARA AS OPÇÕES DO CAMPO "Unidade de controle" COM AS UNIDADES DEVOLVIDAS PELA API,
      NO FORMATO "Nome (sigla)"`);
    test.skip(papelAutenticado !== 'administrador');
    const estoquePage = new EstoquePage(page);
    const produtoModalPage = new ProdutoModalPage(page);
    const helpersPage = new HelpersPage(page);
    const produtoFlows = new ProdutoFlows(page);
    const { botao, campo, titulo } = dados;
    const sessao = await helpersPage.lerLocalStorageComoObjeto(dados.sessao.chaveArmazenamento);
    const unidades = await produtoFlows.listarUnidadesPelaApi(sessao);
    await estoquePage.clicarBotaoCabecalho(botao.novoProduto);
    await produtoModalPage.validarModalVisivel(titulo.novoProduto);
    const opcoes = await produtoModalPage.lerOpcoesCampo(campo.unidade);
    const esperadas = unidades.map(unidade => `${unidade.nome} (${unidade.sigla})`);
    expect(esperadas.length).toBeGreaterThan(0);
    expect([...opcoes].sort()).toEqual([...esperadas].sort());
  });
});
