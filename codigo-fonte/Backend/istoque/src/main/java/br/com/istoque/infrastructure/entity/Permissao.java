package br.com.istoque.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "permissao")
public class Permissao {

    @Id
    @Column(length = 50)
    private String codigo;

    @Column(nullable = false)
    private String descricao;

    @Column(nullable = false, length = 50)
    private String modulo;

    public Permissao() {
    }

    public String getCodigo() { return codigo; }
    public String getDescricao() { return descricao; }
    public String getModulo() { return modulo; }
}
