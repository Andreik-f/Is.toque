-- V3: foto do produto (HT035, modelo do HT029, RF-34 e RE-11).
-- A foto fica numa tabela propria para a listagem de produtos nao carregar a imagem.
-- A imagem fica no proprio banco (bytea): nao ha servico de arquivos separado para
-- manter. O tipo aceita so imagem (jpeg, png, webp, como a tela de edicao de produto),
-- o que deixa de fora svg e html.

CREATE TABLE produto_foto (
    produto_id    integer NOT NULL,
    conteudo      bytea NOT NULL,
    tipo_arquivo  varchar(30) NOT NULL,
    tamanho_bytes integer NOT NULL,
    atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
    -- a chave primaria e o proprio produto_id: no maximo uma foto por produto
    CONSTRAINT produto_foto_pkey PRIMARY KEY (produto_id),
    -- apagar o produto apaga a foto
    CONSTRAINT produto_foto_produto_id_fkey FOREIGN KEY (produto_id) REFERENCES produto (id) ON DELETE CASCADE DEFERRABLE,
    CONSTRAINT ck_foto_tipo_arquivo CHECK (tipo_arquivo IN ('image/jpeg', 'image/png', 'image/webp')),
    -- de 1 byte a 5 MB (5 * 1024 * 1024)
    CONSTRAINT ck_foto_tamanho CHECK (tamanho_bytes BETWEEN 1 AND 5242880),
    -- o tamanho declarado tem de bater com o conteudo; sem isso o limite de 5 MB so
    -- valeria para quem informa o numero certo
    CONSTRAINT ck_foto_tamanho_confere CHECK (tamanho_bytes = octet_length(conteudo))
);
