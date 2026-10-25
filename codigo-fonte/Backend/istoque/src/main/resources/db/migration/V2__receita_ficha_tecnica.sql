-- V2: ficha tecnica da receita (HT035, modelo do HT029).
-- Entram categoria, rendimento e tempo de preparo, e o nome da receita passa a ser
-- unico so entre as receitas ativas.

-- Colunas obrigatorias entram em tres passos, para nao falhar se ja houver receitas:
-- cria aceitando nulo, preenche as linhas existentes e so entao poe NOT NULL.
ALTER TABLE receita
    ADD COLUMN categoria             varchar(60),
    ADD COLUMN rendimento            varchar(60),
    ADD COLUMN tempo_preparo_minutos integer;

-- categoria e texto livre e nao usa a tabela categoria, que e de produtos; rendimento
-- e o texto que a tela mostra, e o calculo de producao nao o usa (HT029).
-- Os valores provisorios abaixo so valem para receitas que ja existam: em 14/10/2026
-- a tabela estava vazia no banco de dev e no de producao.
UPDATE receita SET categoria = 'Sem categoria' WHERE categoria IS NULL;
UPDATE receita SET rendimento = '1 porção' WHERE rendimento IS NULL;
UPDATE receita SET tempo_preparo_minutos = 1 WHERE tempo_preparo_minutos IS NULL;

ALTER TABLE receita
    ALTER COLUMN categoria SET NOT NULL,
    ALTER COLUMN rendimento SET NOT NULL,
    ALTER COLUMN tempo_preparo_minutos SET NOT NULL,
    ADD CONSTRAINT ck_receita_tempo_preparo_positivo CHECK (tempo_preparo_minutos > 0);

-- Nome unico so entre as ativas: uma receita desativada nao impede cadastrar outra
-- com o mesmo nome. O indice novo entra antes de o antigo sair, para nao ficar um
-- instante sem protecao. O antigo (receitas_empresa_id_nome_idx) e um indice solto,
-- sem constraint, por isso sai com DROP INDEX.
CREATE UNIQUE INDEX uk_receita_empresa_nome_ativa ON receita (empresa_id, nome) WHERE ativo;
DROP INDEX receitas_empresa_id_nome_idx;
