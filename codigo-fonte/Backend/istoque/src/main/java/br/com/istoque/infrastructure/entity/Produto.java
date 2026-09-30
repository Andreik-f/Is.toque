package br.com.istoque.infrastructure.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Entity
@Table(name = "produto")

public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    // Relacionamento produto com empresa
    @ManyToOne
    @JoinColumn(name = "empresa_id", nullable = false)
    private Empresa empresa;

    public Empresa getEmpresa() {
        return empresa;
    }

    public void setEmpresa(Empresa empresa) {
        this.empresa = empresa;
    }

    // Relacionamento produto com categoria
    @ManyToOne
    @JoinColumn(name = "categoria_id")
    private Categoria categoria;

    public Categoria getCategoria() {
        return categoria;
    }
    public void setCategoria(Categoria categoria){
        this.categoria = categoria;
    }

    //Relacionamento produto com unidade de medida
    @ManyToOne
    @JoinColumn(name = "unidade_medida_id", nullable = false)
    private UnidadeMedida unidadeMedida;

    public UnidadeMedida getUnidadeMedida() {
        return unidadeMedida;
    }
    public void setUnidadeMedida(UnidadeMedida unidadeMedida){
        this.unidadeMedida = unidadeMedida;
    }

    //Adição dos atributos

    // codigo
    @Column(name = "codigo", length = 50)
    private String codigo;

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }

    // nome
    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    // descricao
    @Column(name = "descricao", length = 255)
    private String descricao;

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    // tipo
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "tipo", nullable = false)
    private TipoProduto tipo;

    public TipoProduto getTipo() {
        return tipo;
    }

    public void setTipo(TipoProduto tipo) {
        this.tipo = tipo;
    }

    // quantidade Atual
    @Column(name = "quantidade_atual", nullable = false, precision = 12, scale = 3)
    private BigDecimal quantidadeAtual = BigDecimal.ZERO;

    public BigDecimal getQuantidadeAtual() {
        return quantidadeAtual;
    }

    public void setQuantidadeAtual(BigDecimal quantidadeAtual) {
        this.quantidadeAtual = quantidadeAtual;
    }

    // estoque mínimo
    @Column(name = "estoque_minimo", nullable = false, precision = 12, scale = 3)
    private BigDecimal estoqueMinimo = BigDecimal.ZERO;

    public BigDecimal getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public void setEstoqueMinimo(BigDecimal estoqueMinimo) {
        this.estoqueMinimo = estoqueMinimo;
    }

    // estoque máximo
    @Column(name = "estoque_maximo", precision = 12, scale = 3)
    private BigDecimal estoqueMaximo;

    public BigDecimal getEstoqueMaximo() {
        return estoqueMaximo;
    }

    public void setEstoqueMaximo(BigDecimal estoqueMaximo) {
        this.estoqueMaximo = estoqueMaximo;
    }

    // controle de validade
    @Column(name = "controla_validade", nullable = false)
    private Boolean controlaValidade = false;

    public Boolean getControlaValidade() {
        return controlaValidade;
    }

    public void setControlaValidade(Boolean controlaValidade) {
        this.controlaValidade = controlaValidade;
    }

    // produto ativo
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    // data de criação
    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    // data da última atualização
    @Column(name = "atualizado_em", nullable = false)
    private OffsetDateTime atualizadoEm;

    public OffsetDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(OffsetDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    public OffsetDateTime getAtualizadoEm() {
        return atualizadoEm;
    }

    public void setAtualizadoEm(OffsetDateTime atualizadoEm) {
        this.atualizadoEm = atualizadoEm;
    }

    // métodos automáticos para as datas
    @PrePersist
    protected void aoCriar() {
        OffsetDateTime agora = OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS);

        this.criadoEm = agora;
        this.atualizadoEm = agora;
    }

    @PreUpdate
    protected void aoAtualizar() {
        this.atualizadoEm = OffsetDateTime.now().truncatedTo(ChronoUnit.SECONDS);
    }

    // construtor vazio para permitir criação de objetos da entidade quando busca dados no banco
    public Produto(){
    }
}
