package br.com.istoque.infrastructure.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;

@Entity
@Table(name = "codigo_verificacao")
public class CodigoVerificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "empresa_id", nullable = false)
    private Integer empresaId;

    // só os códigos de recuperação de senha têm usuário
    @Column(name = "usuario_id")
    private Integer usuarioId;

    @Enumerated(EnumType.STRING)
    @Column(name = "finalidade", nullable = false)
    private FinalidadeCodigo finalidade;

    @Column(name = "codigo_hash", nullable = false)
    private String codigoHash;

    @Column(name = "expira_em", nullable = false)
    private OffsetDateTime expiraEm;

    @Column(name = "tentativas", nullable = false)
    private Integer tentativas = 0;

    @Column(name = "usado", nullable = false)
    private Boolean usado = false;

    @Column(name = "enviado_em", nullable = false)
    private OffsetDateTime enviadoEm;

    public CodigoVerificacao() {
    }

    public CodigoVerificacao(Integer empresaId, FinalidadeCodigo finalidade, String codigoHash,
                             OffsetDateTime enviadoEm, OffsetDateTime expiraEm) {
        this.empresaId = empresaId;
        this.finalidade = finalidade;
        this.codigoHash = codigoHash;
        this.enviadoEm = enviadoEm.truncatedTo(ChronoUnit.SECONDS);
        this.expiraEm = expiraEm.truncatedTo(ChronoUnit.SECONDS);
    }

    public Integer getId() {
        return id;
    }

    public Integer getEmpresaId() {
        return empresaId;
    }

    public void setUsuarioId(Integer usuarioId) {
        this.usuarioId = usuarioId;
    }

    public FinalidadeCodigo getFinalidade() {
        return finalidade;
    }

    public String getCodigoHash() {
        return codigoHash;
    }

    public OffsetDateTime getExpiraEm() {
        return expiraEm;
    }

    public void setExpiraEm(OffsetDateTime expiraEm) {
        this.expiraEm = expiraEm;
    }

    public Integer getTentativas() {
        return tentativas;
    }

    public Boolean getUsado() {
        return usado;
    }

    public OffsetDateTime getEnviadoEm() {
        return enviadoEm;
    }

    public void setEnviadoEm(OffsetDateTime enviadoEm) {
        this.enviadoEm = enviadoEm;
    }
}
