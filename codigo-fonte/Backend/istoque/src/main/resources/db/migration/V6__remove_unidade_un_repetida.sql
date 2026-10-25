-- V6: sai a unidade de medida 'UN', repetida de 'un' (HT035, modelo do HT029).
-- As duas ids sao achadas pela sigla, e nunca por numero, porque o id pode ser
-- diferente de um banco para outro.

-- 'UN' e 'un' coexistiam porque a sigla unica distingue maiusculas. O atualizado_em do
-- produto nao e alterado: e correcao de catalogo, nao edicao do usuario. Em 14/10/2026
-- nenhum produto usava 'UN' no banco de dev nem no de producao.
--
-- 1) Os produtos que usam 'UN' passam para 'un'. Esta e a unica chave estrangeira
--    que aponta para unidade_medida (produto.unidade_medida_id).
UPDATE produto
   SET unidade_medida_id = (SELECT id FROM unidade_medida WHERE sigla = 'un')
 WHERE unidade_medida_id = (SELECT id FROM unidade_medida WHERE sigla = 'UN');

-- 2) So entao a unidade repetida e apagada. Se algum produto ainda a usasse, a chave
--    estrangeira recusaria o DELETE e a migracao desfaria tudo.
DELETE FROM unidade_medida WHERE sigla = 'UN';
