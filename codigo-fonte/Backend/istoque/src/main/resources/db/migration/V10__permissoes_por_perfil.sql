-- V10: permissoes por perfil (HU007).
-- A tabela perfil_permissao da V1 guardava o codigo como texto com CHECK e nunca foi usada.
-- Ela e refeita apontando para a nova tabela permissao. A trava abaixo interrompe a migracao
-- se alguem tiver gravado algo nela, para nao perder dados.
DO $$ BEGIN IF EXISTS (SELECT 1 FROM perfil_permissao) THEN RAISE EXCEPTION 'perfil_permissao não está vazia; migração interrompida'; END IF; END $$;

CREATE TABLE permissao (
    codigo    varchar(50) PRIMARY KEY,
    descricao varchar(255) NOT NULL,
    modulo    varchar(50) NOT NULL
);

INSERT INTO permissao (codigo, descricao, modulo) VALUES
    ('usuarios.gerenciar', 'Cadastrar, editar e inativar usuários', 'Usuários'),
    ('perfis.gerenciar', 'Criar, editar e excluir perfis e suas permissões', 'Perfis'),
    ('empresa.configurar', 'Alterar os dados da empresa', 'Empresa'),
    ('produtos.gerenciar', 'Cadastrar, editar, desativar e reativar produtos e categorias', 'Produtos'),
    ('estoque.movimentar', 'Registrar entradas e saídas de estoque', 'Estoque'),
    ('estoque.ajustar', 'Ajustar o estoque com justificativa', 'Estoque'),
    ('receitas.gerenciar', 'Cadastrar, editar e desativar receitas', 'Receitas'),
    ('producao.registrar', 'Registrar produções', 'Produção'),
    ('relatorios.ver', 'Consultar relatórios', 'Relatórios');

DROP TABLE perfil_permissao;

CREATE TABLE perfil_permissao (
    perfil_id        integer NOT NULL,
    permissao_codigo varchar(50) NOT NULL,
    CONSTRAINT perfil_permissao_pkey PRIMARY KEY (perfil_id, permissao_codigo),
    CONSTRAINT perfil_permissao_perfil_id_fkey FOREIGN KEY (perfil_id) REFERENCES perfil (id) ON DELETE CASCADE,
    CONSTRAINT perfil_permissao_permissao_codigo_fkey FOREIGN KEY (permissao_codigo) REFERENCES permissao (codigo)
);

-- Matriz padrao nos perfis das empresas que ja existem.
INSERT INTO perfil_permissao (perfil_id, permissao_codigo)
SELECT p.id, x.codigo FROM perfil p JOIN permissao x ON p.nome = 'Administrador';

INSERT INTO perfil_permissao (perfil_id, permissao_codigo)
SELECT p.id, x.codigo FROM perfil p JOIN permissao x ON p.nome = 'Gerente'
WHERE x.codigo IN ('produtos.gerenciar', 'estoque.movimentar', 'estoque.ajustar', 'receitas.gerenciar', 'producao.registrar', 'relatorios.ver');

INSERT INTO perfil_permissao (perfil_id, permissao_codigo)
SELECT p.id, x.codigo FROM perfil p JOIN permissao x ON p.nome = 'Funcionário'
WHERE x.codigo IN ('estoque.movimentar', 'producao.registrar');
