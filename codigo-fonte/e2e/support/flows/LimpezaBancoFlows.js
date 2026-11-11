import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { obterEmpresaSuite } from '../../config/usuarios.js';

const ARQUIVO_MASSA = path.resolve(process.cwd(), '.massa-e2e.json');
const PADRAO_EMPRESA_GERADA = '^E2E[0-9]';
const HOSTS_PROIBIDOS = ['ep-super-cake'];

const TABELAS_COM_EMPRESA = ['movimentacao', 'producao', 'receita', 'lote', 'produto', 'categoria'];

export default class LimpezaBancoFlows {
  obterUrlConexao() {
    const url = process.env.E2E_DATABASE_URL;
    if (!url) {
      throw new Error('Defina E2E_DATABASE_URL com a connection string do banco que será limpo (nunca a de produção).');
    }
    const proibido = HOSTS_PROIBIDOS.find(host => url.includes(host));
    if (proibido) {
      throw new Error(`E2E_DATABASE_URL aponta para um host de produção (${proibido}). Limpeza recusada.`);
    }
    return url;
  }

  async executarLimpezaFisica() {
    const { razaoSocial } = obterEmpresaSuite();
    const cliente = new pg.Client({ connectionString: this.obterUrlConexao() });
    await cliente.connect();
    try {
      await cliente.query('BEGIN');
      const geradas = await cliente.query('SELECT id FROM empresa WHERE razao_social ~ $1', [PADRAO_EMPRESA_GERADA]);
      const suite = await cliente.query('SELECT id FROM empresa WHERE razao_social = $1', [razaoSocial]);
      const idsGeradas = geradas.rows.map(linha => linha.id);
      const idsSuite = suite.rows.map(linha => linha.id);
      const removidos = {};
      for (const tabela of TABELAS_COM_EMPRESA) {
        const resultado = await cliente.query(`DELETE FROM ${tabela} WHERE empresa_id = ANY($1::int[])`, [[...idsGeradas, ...idsSuite]]);
        removidos[tabela] = resultado.rowCount;
      }
      removidos.usuario = (await cliente.query('DELETE FROM usuario WHERE empresa_id = ANY($1::int[])', [idsGeradas])).rowCount;
      removidos.perfil = (await cliente.query('DELETE FROM perfil WHERE empresa_id = ANY($1::int[])', [idsGeradas])).rowCount;
      removidos.empresa = (await cliente.query('DELETE FROM empresa WHERE id = ANY($1::int[])', [idsGeradas])).rowCount;
      const restantes = await this.contarResiduos(cliente, idsSuite);
      await cliente.query('COMMIT');
      this.limparArquivoMassa();
      return { removidos, restantes };
    } catch (erro) {
      await cliente.query('ROLLBACK');
      throw erro;
    } finally {
      await cliente.end();
    }
  }

  async contarResiduos(cliente, idsSuite) {
    const resultado = await cliente.query(
      `SELECT
        (SELECT count(*) FROM empresa WHERE razao_social ~ $1)::int AS empresas_geradas,
        (SELECT count(*) FROM produto WHERE empresa_id = ANY($2::int[]))::int AS produtos_da_suite,
        (SELECT count(*) FROM categoria WHERE empresa_id = ANY($2::int[]))::int AS categorias_da_suite`,
      [PADRAO_EMPRESA_GERADA, idsSuite]
    );
    return resultado.rows[0];
  }

  limparArquivoMassa() {
    if (fs.existsSync(ARQUIVO_MASSA)) {
      fs.writeFileSync(ARQUIVO_MASSA, '[]');
    }
  }
}
