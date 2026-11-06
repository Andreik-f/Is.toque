import { expect } from '@playwright/test';

let sequencialCodigo = 0;

export default class HelpersPage {
  constructor(page) {
    this.page = page;
    this.chamadasApi = [];
    this.monitoramentoApiAtivo = false;
  }

  async abrirURL(url) {
    await this.page.goto(url);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async abrirURLERecarregar(url) {
    await this.abrirURL(url);
    await this.recarregarPagina();
  }

  async recarregarPagina() {
    await this.page.reload();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async validarElementoVisivel(locator) {
    try {
      await expect(locator).toBeVisible({ timeout: 15000 });
    } catch (erro) {
      throw new Error(`Falha ao validar visibilidade do elemento: ${locator}`, { cause: erro });
    }
  }

  async validarElementoNaoVisivel(locator) {
    try {
      await expect(locator).toBeHidden({ timeout: 10000 });
    } catch (erro) {
      throw new Error(`Elemento deveria estar oculto: ${locator}`, { cause: erro });
    }
  }

  async aguardarElementoSumir(locator) {
    await locator.waitFor({ state: 'hidden', timeout: 15000 });
  }

  async validarElementoHabilitado(locator) {
    await expect(locator).toBeEnabled({ timeout: 10000 });
  }

  async validarElementoDesabilitado(locator) {
    await expect(locator).toBeDisabled({ timeout: 10000 });
  }

  async clicarElemento(locator) {
    await this.validarElementoVisivel(locator);
    await locator.click();
  }

  async preencherCampoColandoTexto(locator, texto) {
    await this.validarElementoVisivel(locator);
    await this.validarElementoHabilitado(locator);
    await locator.fill(String(texto ?? ''));
    await locator.blur();
  }

  async selecionarOpcaoPorTexto(locator, textoOpcao) {
    await this.validarElementoVisivel(locator);
    await locator.selectOption({ label: textoOpcao });
  }

  async marcarCaixa(locator, marcada = true) {
    await this.validarElementoVisivel(locator);
    await locator.setChecked(marcada);
  }

  async selecionarArquivo(locator, caminho) {
    await locator.setInputFiles(caminho);
  }

  async validarUrl(urlEsperada) {
    try {
      await expect(this.page).toHaveURL(urlEsperada, { timeout: 15000 });
    } catch (erro) {
      throw new Error(`URL não validada! Encontrada = ${this.page.url()}`, { cause: erro });
    }
  }

  async validarTextoLocalExato(locator, textoEsperado) {
    try {
      await expect(locator).toBeVisible({ timeout: 15000 });
      await expect(locator).toHaveText(textoEsperado, { timeout: 10000 });
    } catch (erro) {
      throw new Error(`Texto não validado! Esperado = "${textoEsperado}"`, { cause: erro });
    }
  }

  async validarTextoContido(locator, textoEsperado) {
    try {
      await expect(locator).toBeVisible({ timeout: 15000 });
      await expect(locator).toContainText(textoEsperado, { timeout: 10000 });
    } catch (erro) {
      throw new Error(`Texto não contido! Esperado = "${textoEsperado}"`, { cause: erro });
    }
  }

  async validarTextoNaoVazio(locator) {
    await expect(locator).toBeVisible({ timeout: 15000 });
    await expect(locator).not.toHaveText('', { timeout: 10000 });
  }

  async validarValorCampo(locator, valorEsperado) {
    await expect(locator).toBeVisible({ timeout: 15000 });
    await expect(locator).toHaveValue(valorEsperado, { timeout: 10000 });
  }

  async validarAtributo(locator, atributo, valorEsperado) {
    await expect(locator).toHaveAttribute(atributo, valorEsperado, { timeout: 10000 });
  }

  async validarQuantidadeElementos(locator, quantidadeEsperada) {
    await expect(locator).toHaveCount(quantidadeEsperada, { timeout: 15000 });
  }

  async contarElementos(locator) {
    return locator.count();
  }

  async lerTextoLocal(locator) {
    await this.validarElementoVisivel(locator);
    return (await locator.innerText()).trim();
  }

  async lerTextosLocais(locator) {
    return (await locator.allInnerTexts()).map(texto => texto.trim());
  }

  async validarCampoObrigatorioVazio(locator) {
    await expect.poll(
      () => locator.evaluate(campo => campo.validity.valueMissing),
      { timeout: 10000 }
    ).toBe(true);
  }

  async validarCampoComValorInvalido(locator) {
    await expect.poll(
      () => locator.evaluate(campo => !campo.validity.valid),
      { timeout: 10000 }
    ).toBe(true);
  }

  async lerLocalStorage(chave) {
    return this.page.evaluate(nome => window.localStorage.getItem(nome), chave);
  }

  async lerLocalStorageComoObjeto(chave) {
    const valor = await this.lerLocalStorage(chave);
    return valor ? JSON.parse(valor) : null;
  }

  async gravarLocalStorage(chave, valor) {
    const texto = typeof valor === 'string' ? valor : JSON.stringify(valor);
    await this.page.evaluate(([nome, conteudo]) => window.localStorage.setItem(nome, conteudo), [chave, texto]);
  }

  async injetarLocalStorageEAbrir(chave, valor, urlOrigem, urlDestino) {
    await this.abrirURL(urlOrigem);
    await this.gravarLocalStorage(chave, valor);
    await this.abrirURL(urlDestino);
    await this.recarregarPagina();
  }

  async chamarApi({ metodo, url, token, corpo }) {
    const opcoes = { headers: {} };
    if (token) {
      opcoes.headers['Authorization'] = `Bearer ${token}`;
    }
    if (corpo !== undefined) {
      opcoes.data = corpo;
    }
    const resposta = await this.page.request.fetch(url, { method: metodo, ...opcoes });
    const texto = await resposta.text();
    let conteudo = null;
    try {
      conteudo = texto ? JSON.parse(texto) : null;
    } catch {
      conteudo = texto;
    }
    return { status: resposta.status(), corpo: conteudo };
  }

  async limparLocalStorage() {
    await this.page.evaluate(() => window.localStorage.clear());
  }

  async validarLocalStorageAusente(chave) {
    await expect.poll(() => this.lerLocalStorage(chave), { timeout: 10000 }).toBeNull();
  }

  async validarLocalStoragePresente(chave) {
    await expect.poll(() => this.lerLocalStorage(chave), { timeout: 10000 }).not.toBeNull();
  }

  iniciarMonitoramentoApi(prefixoCaminho = '/api/') {
    if (this.monitoramentoApiAtivo) {
      return;
    }
    this.monitoramentoApiAtivo = true;
    const ehApi = url => new URL(url).pathname.startsWith(prefixoCaminho);
    this.page.on('response', async resposta => {
      const requisicao = resposta.request();
      if (ehApi(requisicao.url())) {
        const cabecalhos = await requisicao.allHeaders();
        this.chamadasApi.push({
          metodo: requisicao.method(),
          url: requisicao.url(),
          status: resposta.status(),
          autorizacao: cabecalhos['authorization'] || null,
        });
      }
    });
    this.page.on('requestfailed', requisicao => {
      if (ehApi(requisicao.url())) {
        this.chamadasApi.push({
          metodo: requisicao.method(),
          url: requisicao.url(),
          status: 0,
          autorizacao: requisicao.headers()['authorization'] || null,
        });
      }
    });
  }

  zerarChamadasApi() {
    this.chamadasApi.length = 0;
  }

  validarNenhumaChamadaApi() {
    expect(this.chamadasApi, `Chamadas à API: ${JSON.stringify(this.chamadasApi)}`).toHaveLength(0);
  }

  validarNenhumaGravacaoApi() {
    const gravacoes = this.chamadasApi.filter(chamada => chamada.metodo !== 'GET');
    expect(gravacoes, `Gravações na API: ${JSON.stringify(gravacoes)}`).toHaveLength(0);
  }

  validarChamadasApiComAutorizacao(token, trechosIgnorados = []) {
    const chamadas = this.chamadasApi.filter(chamada => !trechosIgnorados.some(trecho => chamada.url.includes(trecho)));
    expect(chamadas.length).toBeGreaterThan(0);
    for (const chamada of chamadas) {
      expect(chamada.autorizacao, `${chamada.metodo} ${chamada.url}`).toBe(`Bearer ${token}`);
    }
  }

  // Com `token`, só conta as chamadas feitas com ele: uma requisição da página
  // antiga (token válido) que termina depois do reload não é da página nova.
  validarTodasChamadasApiComStatus(statusEsperado, token) {
    const chamadas = token
      ? this.chamadasApi.filter(chamada => chamada.autorizacao === `Bearer ${token}`)
      : this.chamadasApi;
    expect(chamadas.length).toBeGreaterThan(0);
    for (const chamada of chamadas) {
      expect(chamada.status, `${chamada.metodo} ${chamada.url}`).toBe(statusEsperado);
    }
  }

  async aguardarQuantidadeChamadasApi(metodo, trechoUrl, quantidadeEsperada) {
    await expect.poll(
      () => this.chamadasApi.filter(chamada => chamada.metodo === metodo && chamada.url.includes(trechoUrl)).length,
      { timeout: 15000 }
    ).toBe(quantidadeEsperada);
  }

  async aguardarQuantidadeMinimaChamadasApi(quantidadeMinima) {
    await expect.poll(() => this.chamadasApi.length, { timeout: 15000 }).toBeGreaterThanOrEqual(quantidadeMinima);
  }

  async aguardarRedeOciosa() {
    await this.page.waitForLoadState('networkidle');
  }

  async mockarRespostaApi(padraoUrl, metodo, status, corpo) {
    await this.page.route(padraoUrl, async rota => {
      if (rota.request().method() === metodo) {
        await rota.fulfill({
          status,
          contentType: 'application/json',
          headers: { 'access-control-allow-origin': '*' },
          body: JSON.stringify(corpo),
        });
        return;
      }
      await rota.fallback();
    });
  }

  // Segura a requisição no ar até quem chamou usar a função devolvida; serve
  // para conferir o que a tela mostra enquanto a API ainda não respondeu.
  async segurarRespostaApi(padraoUrl, metodo) {
    let liberar;
    const liberada = new Promise(resolve => (liberar = resolve));
    await this.page.route(padraoUrl, async rota => {
      if (rota.request().method() !== metodo) return rota.fallback();
      await liberada;
      await rota.continue();
    });
    return liberar;
  }

  async bloquearRequisicoesApi(padraoUrl, metodo) {
    this.requisicoesBloqueadas = this.requisicoesBloqueadas || [];
    await this.page.route(padraoUrl, async rota => {
      if (rota.request().method() === metodo) {
        this.requisicoesBloqueadas.push(rota.request().url());
        await rota.abort();
        return;
      }
      await rota.fallback();
    });
  }

  async executarAcaoEAguardarRespostaApi(metodo, trechoUrl, acao) {
    const [resposta] = await Promise.all([
      this.page.waitForResponse(
        r => r.request().method() === metodo && r.url().includes(trechoUrl),
        { timeout: 30000 }
      ),
      acao(),
    ]);
    return resposta;
  }

  async baixarArquivoComAcao(acao) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 15000 }),
      acao(),
    ]);
    return download;
  }

  gerarCodigoAleatorio_abc12345() {
    const letras = 'abcdefghijklmnopqrstuvwxyz';
    let codigo = '';
    for (let i = 0; i < 3; i++) {
      codigo += letras.charAt(Math.floor(Math.random() * letras.length));
    }
    for (let i = 0; i < 5; i++) {
      codigo += Math.floor(Math.random() * 10);
    }
    return codigo;
  }

  gerarTextoAlfanumerico(tamanho) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let texto = '';
    for (let i = 0; i < tamanho; i++) {
      texto += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return texto;
  }

  gerarCodigoUnico() {
    sequencialCodigo += 1;
    const agora = new Date();
    const partes = [
      agora.getFullYear(),
      String(agora.getMonth() + 1).padStart(2, '0'),
      String(agora.getDate()).padStart(2, '0'),
      String(agora.getHours()).padStart(2, '0'),
      String(agora.getMinutes()).padStart(2, '0'),
      String(agora.getSeconds()).padStart(2, '0'),
    ].join('');
    const aleatorio = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `E2E${partes}${sequencialCodigo}${aleatorio}`;
  }
}
