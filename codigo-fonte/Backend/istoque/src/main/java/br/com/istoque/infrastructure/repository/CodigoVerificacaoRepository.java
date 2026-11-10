package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.CodigoVerificacao;
import br.com.istoque.infrastructure.entity.FinalidadeCodigo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

public interface CodigoVerificacaoRepository extends JpaRepository<CodigoVerificacao, Integer> {

    Optional<CodigoVerificacao> findFirstByEmpresaIdAndFinalidadeOrderByEnviadoEmDesc(
            Integer empresaId, FinalidadeCodigo finalidade);

    Optional<CodigoVerificacao> findFirstByEmpresaIdAndFinalidadeAndUsadoFalseOrderByEnviadoEmDesc(
            Integer empresaId, FinalidadeCodigo finalidade);

    long countByEmpresaIdAndFinalidadeAndEnviadoEmAfter(
            Integer empresaId, FinalidadeCodigo finalidade, OffsetDateTime desde);

    Optional<CodigoVerificacao> findFirstByUsuarioIdOrderByEnviadoEmDesc(Integer usuarioId);

    long countByUsuarioIdAndEnviadoEmAfter(Integer usuarioId, OffsetDateTime desde);

    @Modifying
    @Query("update CodigoVerificacao c set c.tentativas = c.tentativas + 1 "
            + "where c.id = :id and c.usado = false and c.tentativas < :limite")
    int registrarTentativa(@Param("id") Integer id, @Param("limite") int limite);

    @Modifying
    @Query("update CodigoVerificacao c set c.usado = true where c.id = :id and c.usado = false")
    int marcarComoUsado(@Param("id") Integer id);

    @Modifying
    @Query("update CodigoVerificacao c set c.usado = true where c.id = :id and c.tentativas >= :limite")
    int invalidarSeEsgotado(@Param("id") Integer id, @Param("limite") int limite);

    @Modifying(flushAutomatically = true)
    @Query("update CodigoVerificacao c set c.usado = true "
            + "where c.empresaId = :empresaId and c.finalidade = :finalidade and c.usado = false")
    void invalidarAtivos(@Param("empresaId") Integer empresaId, @Param("finalidade") FinalidadeCodigo finalidade);
}
