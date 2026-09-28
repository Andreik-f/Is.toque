package br.com.istoque.infrastructure.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(
    name = "usuario",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_usuario_empresa_email",
        columnNames = {"empresa_id", "email"}
    )
)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String email;

    @JsonIgnore
    @Column(name = "senha_hash", nullable = false)
    private String senha;

    @ManyToOne(optional = false)
    @JoinColumn(name = "perfil_id", nullable = false)
    private Perfil perfil;

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "ultimo_acesso")
    private OffsetDateTime ultimoAcesso;

    @Column(name = "bloqueado_ate")
    private OffsetDateTime bloqueadoAte;

    @Column(name = "tentativas_falhas")
    private Integer tentativasFalhas = 0;

    public Usuario() {
    }

    @PrePersist
    protected void aoCriar() {
        if (this.ativo == null) {
            this.ativo = true;
        }
        if (this.tentativasFalhas == null) {
            this.tentativasFalhas = 0;
        }
        this.criadoEm = OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        this.atualizadoEm = this.criadoEm;
    }

    @PreUpdate
    protected void aoAtualizar() {
        this.atualizadoEm = OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    // --- Getters e Setters ---
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
    public Perfil getPerfil() { return perfil; }
    public void setPerfil(Perfil perfil) { this.perfil = perfil; }
    public Empresa getEmpresa() { return empresa; }
    public void setEmpresa(Empresa empresa) { this.empresa = empresa; }
    public Boolean getAtivo() { return ativo; }
    public void setAtivo(Boolean ativo) { this.ativo = ativo; }
    public OffsetDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(OffsetDateTime criadoEm) { this.criadoEm = criadoEm; }
    public OffsetDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(OffsetDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }
    public OffsetDateTime getUltimoAcesso() { return ultimoAcesso; }
    public void setUltimoAcesso(OffsetDateTime ultimoAcesso) { this.ultimoAcesso = ultimoAcesso; }
    public OffsetDateTime getBloqueadoAte() { return bloqueadoAte; }
    public void setBloqueadoAte(OffsetDateTime bloqueadoAte) { this.bloqueadoAte = bloqueadoAte; }
    public Integer getTentativasFalhas() { return tentativasFalhas; }
    public void setTentativasFalhas(Integer tentativasFalhas) { this.tentativasFalhas = tentativasFalhas; }
}
