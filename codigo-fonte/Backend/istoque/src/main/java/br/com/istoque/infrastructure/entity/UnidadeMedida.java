package br.com.istoque.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "unidade_medida")
public class UnidadeMedida {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "sigla", nullable = false, length = 10)
    private String sigla;

    @Column(name = "nome", nullable = false, length = 40)
    private String nome;

    // false para unidades que contam objetos inteiros (ex.: un); a receita só aceita fração quando é true
    @Column(name = "fracionavel", nullable = false)
    private Boolean fracionavel = true;

    public UnidadeMedida() {
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSigla() {
        return sigla;
    }

    public void setSigla(String sigla) {
        this.sigla = sigla;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Boolean getFracionavel() {
        return fracionavel;
    }

    public void setFracionavel(Boolean fracionavel) {
        this.fracionavel = fracionavel;
    }
}
