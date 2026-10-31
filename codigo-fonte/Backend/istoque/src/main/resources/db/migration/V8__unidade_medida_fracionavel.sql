-- V8: unidade de medida passa a dizer se aceita quantidade fracionada (HU015).
-- A ficha tecnica da receita usa a coluna para recusar, por exemplo, 2,5 unidades.

-- Entra com padrao true: kg e L aceitam fracao, e qualquer unidade nova tambem, ate
-- que se diga o contrario.
ALTER TABLE unidade_medida
    ADD COLUMN fracionavel boolean NOT NULL DEFAULT true;

-- O catalogo atual (V1 e V6) tem kg, un e L. So 'un' conta objetos inteiros.
UPDATE unidade_medida SET fracionavel = false WHERE sigla = 'un';
