ALTER TABLE codigo_verificacao
    ADD COLUMN usuario_id integer,
    ADD CONSTRAINT codigo_verificacao_usuario_id_fkey
        FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE;
    
ALTER TABLE codigo_verificacao 
    DROP CONSTRAINT codigo_verificacao_finalidade_check;

ALTER TABLE codigo_verificacao 
    ADD CONSTRAINT codigo_verificacao_finalidade_check
        CHECK (finalidade IN ('CONFIRMACAO_TELEFONE', 'RECUPERACAO_SENHA'));

CREATE INDEX codigo_verificacao_usuario_finalidade_enviado_idx
    ON codigo_verificacao (usuario_id, finalidade, enviado_em);