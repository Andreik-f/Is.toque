-- V4: dias de alerta de validade da empresa passa a ser obrigatorio, com padrao 3
-- (HT035, modelo do HT029).
-- Antes, a coluna aceitava nulo e tinha padrao 7. O padrao nunca valeu na pratica:
-- o Hibernate grava NULL explicito, e o DEFAULT so age quando a coluna fica de fora
-- do INSERT. Por isso as empresas ja cadastradas estavam com NULL (verificado em
-- 14/10/2026 no banco de dev e no de producao).
-- Depende do ajuste da entidade Empresa (padrao 3 ao gravar): sem ele, cadastro ou PUT
-- sem o campo falhariam no NOT NULL, e o ddl-auto=validate nao percebe isso.

-- NULL quer dizer "nunca configurado": passa para o padrao novo.
-- Quem ja escolheu um valor mantem o seu.
UPDATE empresa SET dias_alerta_validade = 3 WHERE dias_alerta_validade IS NULL;

ALTER TABLE empresa
    ALTER COLUMN dias_alerta_validade SET DEFAULT 3,
    ALTER COLUMN dias_alerta_validade SET NOT NULL;
