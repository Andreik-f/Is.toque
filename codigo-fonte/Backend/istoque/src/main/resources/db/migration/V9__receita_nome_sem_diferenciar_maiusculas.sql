-- V9: o nome da receita ativa e unico sem diferenciar maiusculas (HU015).
-- "Bolo" e "bolo" sao o mesmo nome: a aplicacao ja compara assim, e o indice passa a
-- garantir o mesmo no banco, inclusive em requisicoes simultaneas.
--
-- ATENCAO: se um banco ja tiver duas receitas ativas da mesma empresa que so diferem
-- nas maiusculas (ex.: "Bolo" e "bolo"), o CREATE UNIQUE INDEX falha e a migracao
-- desfaz tudo. Nao ha migracao nem carga que crie receitas; so a API cria, e ela ja
-- recusava o repetido. Antes de aplicar em um banco com dados, conferir com:
--   SELECT empresa_id, lower(nome), count(*) FROM receita WHERE ativo
--    GROUP BY empresa_id, lower(nome) HAVING count(*) > 1;
-- O novo indice entra antes de o antigo sair, para nao ficar sem protecao.
CREATE UNIQUE INDEX uk_receita_empresa_nome_ativa_ci ON receita (empresa_id, lower(nome)) WHERE ativo;
DROP INDEX uk_receita_empresa_nome_ativa;
