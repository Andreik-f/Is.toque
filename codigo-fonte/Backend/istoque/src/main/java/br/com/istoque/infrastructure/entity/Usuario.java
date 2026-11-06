package br.com.istoque.infrastructure.entity;

import br.com.istoque.util.EmailUtils;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

// O e-mail é único no sistema todo, porque o login é feito só com e-mail e
// senha. O nome da restrição é o mesmo que ela já tem no banco.
@Entity
@Table(
    name = "usuario",
    uniqueConstraints = @UniqueConstraint(
        name = "usuarios_email_key",
        columnNames = "email"
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

    @Column(name = "token_versao", nullable = false)
    private Integer tokenVersao = 0;

    @Column(name = "ultima_falha_em")
    private OffsetDateTime ultimaFalhaEm;

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
        if (this.tokenVersao == null) {
            this.tokenVersao = 0;
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
    public void setEmail(String email) { this.email = EmailUtils.normalizar(email); } // grava sempre em minúsculas
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
    public Integer getTokenVersao() { return tokenVersao; }
    public void setTokenVersao(Integer tokenVersao) { this.tokenVersao = tokenVersao; }
    public OffsetDateTime getUltimaFalhaEm() { return ultimaFalhaEm; }
    public void setUltimaFalhaEm(OffsetDateTime ultimaFalhaEm) { this.ultimaFalhaEm = ultimaFalhaEm; }
}
