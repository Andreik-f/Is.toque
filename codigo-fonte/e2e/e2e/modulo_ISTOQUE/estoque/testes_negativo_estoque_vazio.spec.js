import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import EstoquePage from '../../../support/pages/modulo_ISTOQUE/EstoquePage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[estoque_vazio_negativo] Testes do estoque de empresa sem produtos', () => {
  test('[CT_#0043] Estoque de empresa nova não tem produtos [estoque]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UMA EMPRESA ISOLADA PELA API, ENTRA COM A SESSÃO DELA E ABRE O ESTOQUE;
      VALIDA "Nenhum produto cadastrado" E A DICA PARA CADASTRAR O PRIMEIRO PRODUTO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const estoquePage = new EstoquePage(nao_autenticado);
    const { mensagem } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsolada();
    await loginFlows.abrirLoginComSessao(sessao);
    await estoquePage.abrirURL(env.urlEstoque);
    await estoquePage.validarEstadoVazio(mensagem.nenhumProduto, mensagem.nenhumProdutoEstoqueDica);
  });
});
