import { test, expect } from '../../fixtures/usuario_autenticado.fixture.js';
import EmpresaFlows from '../../support/flows/EmpresaFlows.js';
import ProdutoFlows from '../../support/flows/ProdutoFlows.js';
import { obterUsuarioPorPapel } from '../../config/usuarios.js';

test.describe('[limpeza] Limpeza de ambiente', () => {
  test('[limpeza_produtos] Desativar produtos ativos das empresas criadas pelos testes', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ENTRA PELA API NA EMPRESA DA SUÍTE E EM CADA EMPRESA REGISTRADA EM .massa-e2e.json, DESATIVA OS PRODUTOS ATIVOS
      E CONFIRMA QUE NÃO RESTOU NENHUM PRODUTO ATIVO. CATEGORIAS, USUÁRIOS E EMPRESAS NÃO TÊM EXCLUSÃO PELA API E SÃO REMOVIDOS
      COM O RESET MANUAL DA BRANCH e2e-teste`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(page);
    const produtoFlows = new ProdutoFlows(page);
    const administrador = obterUsuarioPorPapel('administrador');
    const credenciais = [
      { email: administrador.email, senha: administrador.senha },
      ...empresaFlows.lerEmpresasRegistradas(),
    ];
    for (const credencial of credenciais) {
      const sessao = await empresaFlows.entrarPelaApi(credencial.email, credencial.senha);
      if (sessao) {
        await produtoFlows.desativarProdutosAtivosPelaApi(sessao);
        const restantes = await produtoFlows.listarProdutosAtivosPelaApi(sessao);
        expect(restantes, `Produtos ativos restantes de ${credencial.email}`).toHaveLength(0);
      }
    }
  });
});
