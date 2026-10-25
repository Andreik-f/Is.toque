-- V5: justificativa obrigatoria tambem no motivo 'outro' e na perda por 'outro'
-- (HT035, modelo do HT029).
-- Antes, so o motivo 'ajuste' exigia justificativa (ck_mov_ajuste_justificativa).
-- Passam a exigir: motivo = 'ajuste', motivo = 'outro' e motivo_perda = 'outro'.
--
-- motivo_perda aceita nulo, entao "motivo_perda = 'outro'" daria NULL quando ele esta
-- vazio, e um CHECK que da NULL passa. Por isso o teste usa IS DISTINCT FROM, que
-- trata NULL como "diferente de outro" e sempre devolve verdadeiro ou falso.
--
-- ~ '\S' exige ao menos um caractere que nao seja branco; trim() so tira espaco e
-- deixaria passar tab e quebra de linha. O coalesce evita NULL, que faria o CHECK passar.
--
-- Nao ha correcao de dados antes da constraint: em 14/10/2026 a tabela estava vazia no
-- banco de dev e no de producao. Se houvesse linha sem justificativa, a migracao
-- falharia e desfaria tudo, em vez de inventar uma justificativa num registro de
-- auditoria.

ALTER TABLE movimentacao
    ADD CONSTRAINT ck_mov_justificativa CHECK (
        (motivo NOT IN ('ajuste', 'outro') AND motivo_perda IS DISTINCT FROM 'outro')
        OR coalesce(justificativa, '') ~ '\S'
    );

ALTER TABLE movimentacao DROP CONSTRAINT ck_mov_ajuste_justificativa;
