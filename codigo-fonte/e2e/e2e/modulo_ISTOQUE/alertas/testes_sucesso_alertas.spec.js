import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import AlertasPage from '../../../support/pages/modulo_ISTOQUE/AlertasPage.js';
import ComunsPage from '../../../support/pages/ComunsPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[alertas_sucesso] Testes de alertas com sucesso', () => {
  test('[CT_#0051] Sino de alertas lista produtos com estoque baixo na demonstração [alertas]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      NA DEMONSTRAÇÃO, VALIDA O INDICADOR NO SINO E CLICA NO SINO; VALIDA O MODAL "Sua cozinha pede atenção" COM AS SEÇÕES
      "Validade em até 3 dias" E "Estoque baixo"; CLICA NO PRODUTO COM ESTOQUE BAIXO E VALIDA QUE O MODAL FECHA E O DETALHE ABRE`);
    test.skip(papelAutenticado !== 'administrador');
    const alertasPage = new AlertasPage(nao_autenticado);
    const comunsPage = new ComunsPage(nao_autenticado);
    const { produtoDemo, rotulo, secaoAlertas, titulo } = dados;
    await alertasPage.abrirURL(env.urlDashboard);
    await alertasPage.validarIndicadorSinoVisivel(rotulo.verAlertas);
    await alertasPage.clicarSino(rotulo.verAlertas);
    await alertasPage.validarModalVisivel(titulo.alertas);
    await alertasPage.validarSecaoVisivel(secaoAlertas.validade);
    await alertasPage.validarSecaoVisivel(secaoAlertas.estoqueBaixo);
    await alertasPage.clicarItemEstoqueBaixo(produtoDemo.estoqueBaixo);
    await alertasPage.validarModalFechado(titulo.alertas);
    await comunsPage.validarTitulo(titulo.detalheProduto);
  });
});
