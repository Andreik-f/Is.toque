import fs from 'fs';
import path from 'path';
import HelpersPage from '../pages/HelpersPage';
import env from '../../config/env.js';
import dados from '../../fixtures/dadosBasicos.json';

const ARQUIVO_MASSA = path.resolve(process.cwd(), '.massa-e2e.json');

export default class EmpresaFlows {
  constructor(page) {
    this.page = page;
    this.helpersPage = new HelpersPage(page);
  }

  gerarDadosEmpresaUnica() {
    const codigo = this.helpersPage.gerarCodigoUnico();
    const digitos = String(Math.floor(Math.random() * 100)).padStart(2, '0');
    return {
      codigo,
      razaoSocial: `${codigo} Empresa Teste LTDA`,
      cnpj: `${this.helpersPage.gerarTextoAlfanumerico(12)}${digitos}`,
      nome: dados.cadastro.nomeResponsavelPadrao,
      email: `${codigo.toLowerCase()}@exemplo.com`,
      senha: dados.cadastro.senhaValida,
    };
  }

  async cadastrarEmpresaPelaApi(empresa) {
    const resposta = await this.helpersPage.chamarApi({
      metodo: 'POST',
      url: `${env.apiURL}/api/auth/cadastro`,
      corpo: {
        razaoSocial: empresa.razaoSocial,
        cnpj: empresa.cnpj,
        nome: empresa.nome,
        email: empresa.email,
        senha: empresa.senha,
      },
    });
    if (resposta.status !== 201) {
      throw new Error(`Cadastro da empresa pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
    }
    return resposta.corpo;
  }

  async entrarPelaApi(email, senha) {
    const resposta = await this.helpersPage.chamarApi({
      metodo: 'POST',
      url: `${env.apiURL}/api/auth/login`,
      corpo: { email, senha },
    });
    if (resposta.status === 200) {
      return resposta.corpo;
    }
    // 401: credencial errada; 429: conta bloqueada por tentativas falhas (HT036)
    if (resposta.status === 401 || resposta.status === 429) {
      return null;
    }
    throw new Error(`Login pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
  }

  async trocarSenhaPelaApi(sessao, senhaAtual, novaSenha) {
    const resposta = await this.helpersPage.chamarApi({
      metodo: 'PATCH',
      url: `${env.apiURL}/api/usuarios/me/senha`,
      token: sessao.token,
      corpo: { senhaAtual, novaSenha },
    });
    if (resposta.status !== 204) {
      throw new Error(`Troca de senha pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
    }
  }

  async criarEmpresaIsolada() {
    const empresa = this.gerarDadosEmpresaUnica();
    await this.cadastrarEmpresaPelaApi(empresa);
    const sessao = await this.entrarPelaApi(empresa.email, empresa.senha);
    this.registrarEmpresaParaLimpeza(empresa);
    return { empresa, sessao };
  }

  async listarPerfisPelaApi(sessao) {
    const resposta = await this.helpersPage.chamarApi({
      metodo: 'GET',
      url: `${env.apiURL}/api/perfis`,
      token: sessao.token,
    });
    if (resposta.status !== 200) {
      throw new Error(`Listagem de perfis falhou: ${resposta.status}`);
    }
    return resposta.corpo;
  }

  async criarUsuarioPelaApi(sessaoAdministrador, usuario) {
    const resposta = await this.helpersPage.chamarApi({
      metodo: 'POST',
      url: `${env.apiURL}/api/usuarios`,
      token: sessaoAdministrador.token,
      corpo: usuario,
    });
    if (resposta.status !== 201) {
      throw new Error(`Cadastro do usuário pela API falhou: ${resposta.status} ${JSON.stringify(resposta.corpo)}`);
    }
    return resposta.corpo;
  }

  async garantirUsuarioDaSuite(empresaSuite, usuarioAdministrador, usuario) {
    const sessaoExistente = await this.entrarPelaApi(usuario.email, usuario.senha);
    if (sessaoExistente) {
      return sessaoExistente;
    }
    if (usuario.perfil === dados.perfil.administrador) {
      await this.cadastrarEmpresaPelaApi({
        razaoSocial: empresaSuite.razaoSocial,
        cnpj: empresaSuite.cnpj,
        nome: usuario.nome,
        email: usuario.email,
        senha: usuario.senha,
      });
      return this.entrarPelaApi(usuario.email, usuario.senha);
    }
    const sessaoAdministrador = await this.entrarPelaApi(usuarioAdministrador.email, usuarioAdministrador.senha);
    const perfis = await this.listarPerfisPelaApi(sessaoAdministrador);
    const perfil = perfis.find(item => item.nome === usuario.perfil);
    await this.criarUsuarioPelaApi(sessaoAdministrador, {
      nome: usuario.nome,
      email: usuario.email,
      senha: usuario.senha,
      perfilId: perfil.id,
    });
    return this.entrarPelaApi(usuario.email, usuario.senha);
  }

  registrarEmpresaParaLimpeza(empresa) {
    const registros = this.lerEmpresasRegistradas();
    registros.push({ email: empresa.email, senha: empresa.senha });
    fs.writeFileSync(ARQUIVO_MASSA, JSON.stringify(registros, null, 2));
  }

  lerEmpresasRegistradas() {
    if (!fs.existsSync(ARQUIVO_MASSA)) {
      return [];
    }
    return JSON.parse(fs.readFileSync(ARQUIVO_MASSA, 'utf-8'));
  }
}
