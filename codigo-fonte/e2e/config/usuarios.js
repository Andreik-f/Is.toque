const EMPRESA_SUITE = Object.freeze({
    razaoSocial: 'E2E Suite Automatizada LTDA',
    cnpj: 'E2ESUITE000101',
});

const USUARIOS_POR_PAPEL = Object.freeze({
    administrador: {
        email: 'e2e.administrador@exemplo.com',
        senha: 'E2e-Senha-Forte-1',
        nome: 'E2E Administrador',
        perfil: 'Administrador',
    },
    gerente: {
        email: 'e2e.gerente@exemplo.com',
        senha: 'E2e-Senha-Forte-2',
        nome: 'E2E Gerente',
        perfil: 'Gerente',
    },
    funcionario: {
        email: 'e2e.funcionario@exemplo.com',
        senha: 'E2e-Senha-Forte-3',
        nome: 'E2E Funcionario',
        perfil: 'Funcionário',
    },
});

const PAPEL_AUTENTICADO_PADRAO = 'administrador';

export function obterEmpresaSuite() {
    return EMPRESA_SUITE;
}

export function obterPapeisDisponiveis() {
    return Object.keys(USUARIOS_POR_PAPEL);
}

export function obterPapelAutenticado() {
    const papel = (process.env.PAPEL_AUTENTICADO || PAPEL_AUTENTICADO_PADRAO).trim().toLowerCase();
    if (!USUARIOS_POR_PAPEL[papel]) {
        throw new Error(`PAPEL_AUTENTICADO inválido: "${papel}". Valores aceitos: ${obterPapeisDisponiveis().join(', ')}`);
    }
    return papel;
}

export function obterUsuarioPorPapel(papel = obterPapelAutenticado()) {
    const papelNormalizado = papel.trim().toLowerCase();
    const usuario = USUARIOS_POR_PAPEL[papelNormalizado];
    if (!usuario) {
        throw new Error(`Usuário não encontrado para o papel "${papel}".`);
    }
    return { papel: papelNormalizado, ...usuario };
}

export function obterUsuarios() {
    return USUARIOS_POR_PAPEL;
}

export function obterCaminhoArmazenamentoEstado(modulo, papel = obterPapelAutenticado()) {
    return `storageState-${modulo}-${papel}.json`;
}
