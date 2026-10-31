package br.com.istoque.infrastructure.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "receita_item")
public class ItemReceita {

    // A chave é (receita_id, produto_id); as duas partes vêm das associações abaixo
    @EmbeddedId
    private ItemReceitaId id = new ItemReceitaId();

    @MapsId("receitaId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receita_id", nullable = false)
    private Receita receita;

    @MapsId("produtoId")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidade;

    public ItemReceitaId getId() { return id; }
    public Receita getReceita() { return receita; }
    public void setReceita(Receita receita) { this.receita = receita; }
    public Produto getProduto() { return produto; }
    public void setProduto(Produto produto) { this.produto = produto; }
    public BigDecimal getQuantidade() { return quantidade; }
    public void setQuantidade(BigDecimal quantidade) { this.quantidade = quantidade; }
}
