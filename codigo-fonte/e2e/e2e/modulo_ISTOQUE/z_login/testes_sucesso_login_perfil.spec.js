import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import { obterUsuarioPorPapel } from '../../../config/usuarios.js';

test.describe('[login_perfil_sucesso] Testes de login por perfil', () => {
  test.beforeEach(async ({ page, papelAutenticado }) => {
    test.skip(!['gerente', 'funcionario'].includes(papelAutenticado));
    const loginFlows = new LoginFlows(page);
    await loginFlows.entrarUrlAutenticada();
  });

  test('[CT_#0006] Login por perfil mostra nome e perfil no menu [login_perfil]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ABRE O PAINEL COM A SESSÃO DO GERENTE OU DO FUNCIONÁRIO E VALIDA O NOME E O PERFIL NO RODAPÉ DO MENU
      E QUE OS MESMOS ITENS DE MENU DO ADMINISTRADOR ESTÃO VISÍVEIS`);
    test.skip(!['gerente', 'funcionario'].includes(papelAutenticado));
    const comunsPage = new ComunsPage(page);
    const { menu, titulo } = dados;
    const usuario = obterUsuarioPorPapel(papelAutenticado);
    await comunsPage.validarTitulo(titulo.painel);
    await comunsPage.validarNomeEPerfilUsuarioMenu(usuario.nome, usuario.perfil);
    for (const item of Object.values(menu)) {
      await comunsPage.validarMenuLateralVisivel(item);
    }
  });
});
