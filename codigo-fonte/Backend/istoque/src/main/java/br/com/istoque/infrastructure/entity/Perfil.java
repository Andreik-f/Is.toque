package br.com.istoque.infrastructure.entity;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

import jakarta.persistence.*;

@Entity
@Table(
    name = "perfil",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_perfil_empresa_nome",
        columnNames = {"empresa_id", "nome"}
    )
)
public class Perfil {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "descricao")
    private String descricao;

    @ManyToOne(optional = false)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @PrePersist
    protected void aoCriar(){
        this.criadoEm = OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    public OffsetDateTime getCriadoEm() { return criadoEm; }

    public Perfil() {
    }

    public Perfil(String nome, String descricao, Empresa empresa) {
        this.nome = nome;
        this.descricao = descricao;
        this.empresa = empresa;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
}
