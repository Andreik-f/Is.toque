-- V12: versao do token do usuario e janela de falhas de senha (HT036).

ALTER TABLE usuario ADD COLUMN token_versao integer NOT NULL DEFAULT 0;
ALTER TABLE usuario ADD COLUMN ultima_falha_em timestamp(6) with time zone;
