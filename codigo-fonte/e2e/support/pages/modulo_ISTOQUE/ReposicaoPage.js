import HelpersPage from '../HelpersPage';
import reposicaoLocators from '../../locators/modulo_ISTOQUE/reposicaoLocators';
import comunsLocators from '../../locators/comunsLocators';

export default class ReposicaoPage {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  async abrirURL(url) {
    await this.helpersPage.abrirURL(url);
  }

  async clicarBotaoLinha(nomeProduto, nomeBotao) {
    const botao = this.page.locator(reposicaoLocators.getBotaoLinha(nomeProduto, nomeBotao));
    await this.helpersPage.clicarElemento(botao);
  }

  async validarLinhaProdutoVisivel(nomeProduto) {
    const linha = this.page.locator(reposicaoLocators.getLinhaProduto(nomeProduto));
    await this.helpersPage.validarElementoVisivel(linha);
  }

  async validarCelulaLinha(nomeProduto, nomeColuna, textoEsperado) {
    const celula = this.page.locator(reposicaoLocators.getCelulaLinha(nomeProduto, nomeColuna));
    await this.helpersPage.validarTextoContido(celula, textoEsperado);
  }

  async validarEstadoVazio(tituloVazio, textoVazio) {
    const vazio = this.page.locator(comunsLocators.getVazio(tituloVazio));
    const texto = this.page.locator(comunsLocators.getTextoVazio(tituloVazio, textoVazio));
    await this.helpersPage.validarElementoVisivel(vazio);
    await this.helpersPage.validarElementoVisivel(texto);
  }

  async validarModalVisivel(tituloModal) {
    const modal = this.page.locator(comunsLocators.getModal(tituloModal));
    await this.helpersPage.validarElementoVisivel(modal);
  }
}
