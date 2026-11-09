import { test } from '../../../fixtures/nao_autenticado.fixture.js';
import HelpersPage from '../../../support/pages/HelpersPage.js';
import TelefoneEmpresaPage from '../../../support/pages/modulo_ISTOQUE/TelefoneEmpresaPage.js';
import EmpresaFlows from '../../../support/flows/EmpresaFlows.js';
import LoginFlows from '../../../support/flows/LoginFlows.js';
import dados from '../../../fixtures/dadosBasicos.json';

test.describe('[telefone_empresa_negativo] Testes do telefone da empresa com erro', () => {
  test('[CT_#0065] Código errado mostra a mensagem genérica e limpa o campo [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO PELA TELA, DIGITA 000000 E CONFIRMA; VALIDA "Código inválido ou vencido." (SEM DIZER QUAL DOS DOIS),
      O CAMPO DO CÓDIGO VAZIO E A SITUAÇÃO AINDA "Não confirmado"`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const telefonePage = new TelefoneEmpresaPage(nao_autenticado);
    const { telefoneEmpresa } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsoladaComTelefone();
    await loginFlows.abrirLoginComSessao(sessao);
    await telefonePage.abrirConfiguracoesPeloMenu(telefoneEmpresa.linkConfiguracoes);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoEnviarCodigo);
    await telefonePage.preencherCodigo(telefoneEmpresa.codigoErrado);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoConfirmar);
    await telefonePage.validarAlerta(telefoneEmpresa.codigoInvalido);
    await telefonePage.validarCampoCodigoVazio();
    await telefonePage.validarSelo(telefoneEmpresa.naoConfirmado);
  });

  test('[CT_#0066] Novo pedido de código antes de 60 segundos mostra a mensagem de bloqueio [telefone_empresa]', async ({ nao_autenticado, papelAutenticado }) => {
    console.info(`
      ➡️ DESCRIÇÃO DO TESTE ⬅️
      PEDE O CÓDIGO, RECARREGA A PÁGINA (A CONTAGEM LOCAL SE PERDE) E PEDE DE NOVO; O BACK RESPONDE 429 E A TELA
      MOSTRA A MENSAGEM DE BLOQUEIO E CONTINUA COM O CAMPO DO CÓDIGO`);
    test.skip(papelAutenticado !== 'administrador');
    const empresaFlows = new EmpresaFlows(nao_autenticado);
    const loginFlows = new LoginFlows(nao_autenticado);
    const telefonePage = new TelefoneEmpresaPage(nao_autenticado);
    const helpersPage = new HelpersPage(nao_autenticado);
    const { telefoneEmpresa } = dados;
    const { sessao } = await empresaFlows.criarEmpresaIsoladaComTelefone();
    await loginFlows.abrirLoginComSessao(sessao);
    await telefonePage.abrirConfiguracoesPeloMenu(telefoneEmpresa.linkConfiguracoes);
    await telefonePage.clicarBotao(telefoneEmpresa.botaoEnviarCodigo);
    await telefonePage.validarContagemDoReenvio();
    await helpersPage.recarregarPagina();
    await telefonePage.clicarBotao(telefoneEmpresa.botaoEnviarCodigo);
    await telefonePage.validarAlerta(telefoneEmpresa.bloqueio);
    await telefonePage.validarCampoCodigoVisivel();
  });
});
