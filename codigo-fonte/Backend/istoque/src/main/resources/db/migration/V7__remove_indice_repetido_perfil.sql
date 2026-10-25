-- V7: sai o indice unico repetido em perfil (HT035, modelo do HT029).
-- Havia dois iguais em (empresa_id, nome): a constraint uk_perfil_empresa_nome, que a
-- entidade Perfil declara pelo nome, e o indice solto perfis_empresa_id_nome_idx.
-- Fica a constraint. O indice solto nao e dono de nenhuma constraint, por isso sai
-- com DROP INDEX.

DROP INDEX perfis_empresa_id_nome_idx;
