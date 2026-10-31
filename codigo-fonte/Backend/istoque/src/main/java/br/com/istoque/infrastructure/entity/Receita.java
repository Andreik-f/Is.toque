package br.com.istoque.infrastructure.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "receita")
public class Receita {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(columnDefinition = "text")
    private String descricao;

    @Column(nullable = false, length = 60)
    private String categoria;

    @Column(nullable = false, length = 60)
    private String rendimento;

    @Column(name = "tempo_preparo_minutos", nullable = false)
    private Integer tempoPreparoMinutos;

    @Column(nullable = false)
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    @OneToMany(mappedBy = "receita", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemReceita> itens = new ArrayList<>();

    public void adicionarItem(ItemReceita item) {
        itens.add(item);
        item.setReceita(this);
    }

    public Integer getId() { return id; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getRendimento() { return rendimento; }
    public void setRendimento(String rendimento) { this.rendimento = rendimento; }
    public Integer getTempoPreparoMinutos() { return tempoPreparoMinutos; }
    public void setTempoPreparoMinutos(Integer tempoPreparoMinutos) { this.tempoPreparoMinutos = tempoPreparoMinutos; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public OffsetDateTime getAtualizadoEm() { return atualizadoEm; }
    public List<ItemReceita> getItens() { return itens; }
}
