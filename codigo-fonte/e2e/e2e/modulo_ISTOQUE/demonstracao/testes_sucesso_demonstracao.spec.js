import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[demonstracao_sucesso] Testes do modo demonstração com sucesso', () => {
  test('[CT_#0019] Rotas internas abrem em modo demonstração sem sessão [demonstracao]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      SEM SESSÃO, ABRE CADA ROTA INTERNA DO SISTEMA E VALIDA A URL, O TÍTULO DA TELA, O ITEM ATIVO DO MENU
      E O SELO "Protótipo interativo", SEM NENHUMA CHAMADA À API`);
    test.skip(papelAutenticado !== 'administrador');
    const comunsPage = new ComunsPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { rotaDemonstracao, selo } = dados;
    helpersPage.iniciarMonitoramentoApi();
    await helpersPage.abrirURL(env.baseURL);
    for (const item of rotaDemonstracao) {
      await helpersPage.abrirURL(`${env.baseURL}/#${item.rota}`);
      await comunsPage.validarUrl(`${env.baseURL}/#${item.rota}`);
      await comunsPage.validarTitulo(item.titulo);
      await comunsPage.validarTextoTopbar(selo.demonstracao);
      if (item.menu) {
        await comunsPage.validarMenuLateralAtivo(item.menu);
      }
    }
    await helpersPage.aguardarRedeOciosa();
    helpersPage.validarNenhumaChamadaApi();
  });
});
