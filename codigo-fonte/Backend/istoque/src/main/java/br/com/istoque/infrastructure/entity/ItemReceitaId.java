package br.com.istoque.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

/** Chave composta de receita_item: o mesmo produto só aparece uma vez em cada receita. */
@Embeddable
public class ItemReceitaId implements Serializable {

    @Column(name = "receita_id")
    private Integer receitaId;

    @Column(name = "produto_id")
    private Integer produtoId;

    public ItemReceitaId() {
    }

    public Integer getReceitaId() { return receitaId; }
    public Integer getProdutoId() { return produtoId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ItemReceitaId outro)) return false;
        return Objects.equals(receitaId, outro.receitaId) && Objects.equals(produtoId, outro.produtoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(receitaId, produtoId);
    }
}
