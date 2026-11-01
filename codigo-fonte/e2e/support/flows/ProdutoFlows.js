import HelpersPage from '../pages/HelpersPage';
import EmpresaFlows from './EmpresaFlows';
import env from '../../config/env.js';

export default class ProdutoFlows {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
    this.empresaFlows = new EmpresaFlows(page);
  }

  gerarNomeUnico(sufixo = 'Produto') {
    return `${this.helpersPage.gerarCodigoUnico()} ${sufixo}`;
  }

  async desativarProdutosPorNome(email, senha, nomes) {
    const sessao = await this.empresaFlows.entrarPelaApi(email, senha);
    if (!sessao) {
      return;
    }
    const produtos = await this.listarProdutosAtivosPelaApi(sessao);
    for (const produto of produtos.filter(item => nomes.includes(item.nome))) {
      await this.desativarProdutoPelaApi(sessao, produto.id);
    }
  }

  async chamarApiAutenticada(sessao, metodo, caminho, corpo) {
    return this.helpersPage.chamarApi({
      metodo,
      url: `${env.apiURL}${caminho}`,
      token: sessao.token,
      corpo,
    });
  }

  async listarUnidadesPelaApi(sessao) {
    const resposta = await this.chamarApiAutenticada(sessao, 'GET', '/api/unidades-medida');
    return resposta.corpo;
  }

  async listarCategoriasPelaApi(sessao) {
    const resposta = await this.chamarApiAutenticada(sessao, 'GET', '/api/categorias');
    return resposta.corpo;
  }

  async listarProdutosAtivosPelaApi(sessao) {
    const resposta = await this.chamarApiAutenticada(sessao, 'GET', '/api/produtos/ativos');
    return resposta.corpo;
  }

  async listarProdutosPelaApi(sessao) {
    const resposta = await this.chamarApiAutenticada(sessao, 'GET', '/api/produtos');
    return resposta.corpo;
  }

  async buscarProdutoPorNomePelaApi(sessao, nome) {
    const produtos = await this.listarProdutosPelaApi(sessao);
    return produtos.filter(produto => produto.nome === nome);
  }

  async buscarProdutoPorIdPelaApi(sessao, id) {
    const resposta = await this.chamarApiAutenticada(sessao, 'GET', `/api/produtos/${id}`);
    return resposta.corpo;
  }

  async criarCategoriaPelaApi(sessao, nome) {
    const resposta = await this.chamarApiAutenticada(sessao, 'POST', '/api/categorias', { nome });
    if (resposta.status !== 201) {
      throw new Error(`Cadastro da categoria pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
    }
    return resposta.corpo;
  }

  async criarProdutoPelaApi(sessao, { nome, estoqueMinimo = 1, estoqueMaximo = 10, siglaUnidade = 'kg', categoriaId = null, tipo = 'insumo' }) {
    const unidades = await this.listarUnidadesPelaApi(sessao);
    const unidade = unidades.find(item => item.sigla === siglaUnidade);
    const resposta = await this.chamarApiAutenticada(sessao, 'POST', '/api/produtos', {
      nome,
      tipo,
      estoqueMinimo,
      estoqueMaximo,
      unidadeMedidaId: unidade.id,
      categoriaId,
      controlaValidade: false,
    });
    if (resposta.status !== 201) {
      throw new Error(`Cadastro do produto pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
    }
    return resposta.corpo;
  }

  async desativarProdutoPelaApi(sessao, id) {
    const resposta = await this.chamarApiAutenticada(sessao, 'PATCH', `/api/produtos/${id}/desativar`);
    if (resposta.status !== 200) {
      throw new Error(`Desativação do produto ${id} pela API falhou: ${resposta.status}`);
    }
  }

  async desativarProdutosAtivosPelaApi(sessao) {
    const ativos = await this.listarProdutosAtivosPelaApi(sessao);
    for (const produto of ativos) {
      await this.desativarProdutoPelaApi(sessao, produto.id);
    }
    return ativos.length;
  }
}
