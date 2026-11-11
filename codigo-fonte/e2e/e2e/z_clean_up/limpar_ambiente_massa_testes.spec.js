import { test, expect } from '../../fixtures/usuario_autenticado.fixture.js';
import LimpezaBancoFlows from '../../support/flows/LimpezaBancoFlows.js';

test.describe('[limpeza] Limpeza de ambiente', () => {
  test('[limpeza_fisica] Excluir do banco a massa criada pelos testes', async ({ papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      EXCLUI FISICAMENTE NO BANCO (E2E_DATABASE_URL) AS EMPRESAS GERADAS PELOS TESTES (RAZÃO SOCIAL E2E + DATA/HORA) COM USUÁRIOS,
      PERFIS, PRODUTOS E CATEGORIAS, E OS PRODUTOS E CATEGORIAS DA EMPRESA DA SUÍTE. CONFIRMA QUE NADA DISSO RESTOU.
      NUNCA APONTE PARA O BANCO DE PRODUÇÃO`);
    test.skip(papelAutenticado !== 'administrador');
    const limpezaBancoFlows = new LimpezaBancoFlows();
    const { removidos, restantes } = await limpezaBancoFlows.executarLimpezaFisica();
    console.info(`Removidos: ${JSON.stringify(removidos)}`);
    expect(restantes.empresas_geradas, 'Empresas geradas restantes').toBe(0);
    expect(restantes.produtos_da_suite, 'Produtos restantes da empresa da suíte').toBe(0);
    expect(restantes.categorias_da_suite, 'Categorias restantes da empresa da suíte').toBe(0);
  });
});
