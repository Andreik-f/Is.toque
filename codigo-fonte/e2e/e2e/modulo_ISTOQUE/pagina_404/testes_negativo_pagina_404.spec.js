import { test } from '../../../fixtures/usuario_autenticado.fixture.js';
import NaoEncontradaPage from '../../../support/pages/modulo_ISTOQUE/NaoEncontradaPage.js';
import LoginPage from '../../../support/pages/LoginPage.js';
import dados from '../../../fixtures/dadosBasicos.json';
import env from '../../../config/env.js';

test.describe('[pagina_404_negativo] Testes de endereço inválido', () => {
  test('[CT_#0023] Rota inválida mostra a página 404 [pagina_404]', async ({ page, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      ESTANDO LOGADO, ABRE UM ENDEREÇO INVÁLIDO COM HASH (#xyz) E DEPOIS UM CAMINHO INVÁLIDO (/abc);
      VALIDA EM CADA UM "ERRO 404", O TÍTULO "Essa prateleira está vazia.", O ENDEREÇO DIGITADO NA MENSAGEM E QUE A SESSÃO CONTINUA`);
    test.skip(papelAutenticado !== 'administrador');
    const naoEncontradaPage = new NaoEncontradaPage(page);
    const loginPage = new LoginPage(page);
    const { mensagem, naoEncontrada, titulo } = dados;
    await naoEncontradaPage.abrirURL(`${env.baseURL}/#${naoEncontrada.hashInexistente}`);
    await naoEncontradaPage.validarEtiqueta(mensagem.erro404Etiqueta);
    await naoEncontradaPage.validarTitulo(titulo.naoEncontrada);
    await naoEncontradaPage.validarEndereco(`#${naoEncontrada.hashInexistente}`);
    await naoEncontradaPage.abrirURL(`${env.baseURL}${naoEncontrada.caminhoInexistente}`);
    await naoEncontradaPage.validarEtiqueta(mensagem.erro404Etiqueta);
    await naoEncontradaPage.validarTitulo(titulo.naoEncontrada);
    await naoEncontradaPage.validarEndereco(naoEncontrada.caminhoInexistente);
    await loginPage.validarSessaoGravada();
  });
});
