package br.com.istoque.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import br.com.istoque.infrastructure.entity.Categoria;
import br.com.istoque.infrastructure.entity.Produto;
import br.com.istoque.infrastructure.entity.TipoProduto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProdutoResponseDTO(
        Integer id,
        String codigo,
        String nome,
        String descricao,
        TipoProduto tipo,
        Integer empresaId,
        Integer categoriaId,
        String categoria,
        Integer unidadeMedidaId,
        String unidadeMedida,
        BigDecimal quantidadeAtual,
        BigDecimal estoqueMinimo,
        BigDecimal estoqueMaximo,
        Boolean controlaValidade,
        Boolean ativo,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime criadoEm,

        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
        OffsetDateTime atualizadoEm
) {

    public static ProdutoResponseDTO fromEntity(Produto produto) {
        Categoria categoria = produto.getCategoria();
        return new ProdutoResponseDTO(
                produto.getId(),
                produto.getCodigo(),
                produto.getNome(),
                produto.getDescricao(),
                produto.getTipo(),
                produto.getEmpresa().getId(),
                categoria != null ? categoria.getId() : null,
                categoria != null ? categoria.getNome() : null,
                produto.getUnidadeMedida().getId(),
                produto.getUnidadeMedida().getSigla(),
                produto.getQuantidadeAtual(),
                produto.getEstoqueMinimo(),
                produto.getEstoqueMaximo(),
                produto.getControlaValidade(),
                produto.getAtivo(),
                produto.getCriadoEm(),
                produto.getAtualizadoEm()
        );
    }
}
