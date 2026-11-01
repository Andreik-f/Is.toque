import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import ReposicaoPage from '../../../support/pages/modulo_ISTOQUE/ReposicaoPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[reposicao_negativo] Testes de reposição sem pendências', () => {
  test('[CT_#0054] Empresa sem produtos abaixo do mínimo não tem nada a repor [reposicao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      CRIA UMA EMPRESA ISOLADA SEM PRODUTOS, ENTRA COM A SESSÃO DELA E ABRE A REPOSIÇÃO;
      VALIDA "Estoque abastecido" COM A DICA "Nenhum produto está no mínimo ou abaixo dele."`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const reposicaoPage = new ReposicaoPage(nao_autenticado);
    const { mensagem } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsolada();
    await loginFlows.abrirLoginComSessao(sessao);
    await reposicaoPage.abrirURL(env.urlReposicao);
    await reposicaoPage.validarEstadoVazio(mensagem.estoqueAbastecido, mensagem.estoqueAbastecidoDica);
  });
});
