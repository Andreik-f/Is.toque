package com.istoque.backend.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "usuario")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false)
    private String email;

    // ALERTA DE ERRO 500 RESOLVIDO: Aponta para a coluna senha_hash do banco
    @Column(name = "senha_hash", nullable = false)
    private String senha;

    // ALERTA DE ERRO 500 RESOLVIDO: Agora usa o perfil_id como um número
    @Column(name = "perfil_id", nullable = false)
    private Integer perfilId; 

    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    @Column(name = "ativo", nullable = false)
    private Boolean ativo;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    // --- Colunas de controle adicionadas para bater com o banco ---
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
    public Integer getPerfilId() { return perfilId; }
    public void setPerfilId(Integer perfilId) { this.perfilId = perfilId; }
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