import { chromium } from '@playwright/test';
import LoginFlows from '../support/flows/LoginFlows.js';
import EmpresaFlows from '../support/flows/EmpresaFlows.js';
import env from '../config/env.js';
import { obterEmpresaSuite, obterUsuarioPorPapel, obterCaminhoArmazenamentoEstado } from '../config/usuarios.js';

const papeis = [
    { nome: 'administrador', modulo: 'istoque' },
    { nome: 'gerente', modulo: 'istoque' },
    { nome: 'funcionario', modulo: 'istoque' },
];

async function validarApiNoAr() {
    let resposta;
    try {
        resposta = await fetch(`${env.apiURL}/actuator/health`);
    } catch (erro) {
        throw new Error(`A API não respondeu em ${env.apiURL}/actuator/health. Suba o back local apontando para a branch e2e-teste antes de rodar os testes.`, { cause: erro });
    }
    if (resposta.status !== 200) {
        throw new Error(`A API respondeu ${resposta.status} em ${env.apiURL}/actuator/health. Verifique o back local.`);
    }
}

async function globalSetup() {
    await validarApiNoAr();
    const browser = await chromium.launch({ headless: true });
    const empresaSuite = obterEmpresaSuite();
    const administrador = obterUsuarioPorPapel('administrador');
    for (const papel of papeis) {
        const context = await browser.newContext({ locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
        const page = await context.newPage();
        const empresaFlows = new EmpresaFlows(page);
        const loginFlows = new LoginFlows(page);
        const usuario = obterUsuarioPorPapel(papel.nome);
        console.log(`[global-setup] Autenticando papel "${papel.nome}" (${usuario.nome})`);
        await empresaFlows.garantirUsuarioDaSuite(empresaSuite, administrador, usuario);
        await loginFlows.realizarLogin(usuario.email, usuario.senha);
        const caminho = obterCaminhoArmazenamentoEstado(papel.modulo, papel.nome);
        await context.storageState({ path: caminho });
        await context.close();
        console.log(`[global-setup] Sessão salva: ${caminho}`);
    }
    await browser.close();
}

export default globalSetup;
