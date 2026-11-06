package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Usuario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByIdAndEmpresaId(Integer id, Integer empresaId);

    List<Usuario> findByEmpresaIdOrderByNome(Integer empresaId);

    long countByEmpresaIdAndPerfilNomeAndAtivoTrue(Integer empresaId, String perfilNome);

    boolean existsByEmail(String email);

    boolean existsByPerfilId(Integer perfilId);

    boolean existsByEmailAndIdNot(String email, Integer id);

    // update direto, sem passar pelo @PreUpdate: registrar um acesso não é
    // uma alteração no cadastro, então não pode mudar o atualizadoEm
    @Modifying
    @Query("update Usuario u set u.ultimoAcesso = :agora where u.id = :id")
    void registrarAcesso(@Param("id") Integer id, @Param("agora") OffsetDateTime agora);

    // trava a linha para que duas senhas erradas simultâneas da mesma conta não percam contagem
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Usuario u where u.id = :id")
    Optional<Usuario> buscarComTrava(@Param("id") Integer id);

    // update direto, sem passar pelo @PreUpdate: errar a senha não é uma
    // alteração no cadastro, então não pode mudar o atualizadoEm
    @Modifying(clearAutomatically = true)
    @Query("""
            update Usuario u
               set u.tentativasFalhas = :falhas,
                   u.bloqueadoAte = :bloqueadoAte,
                   u.ultimaFalhaEm = :agora
             where u.id = :id
            """)
    void gravarFalhasDeSenha(@Param("id") Integer id,
                             @Param("falhas") int falhas,
                             @Param("bloqueadoAte") OffsetDateTime bloqueadoAte,
                             @Param("agora") OffsetDateTime agora);

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Modifying(clearAutomatically = true)
    @Query("update Usuario u set u.tentativasFalhas = 0, u.bloqueadoAte = null, u.ultimaFalhaEm = null where u.id = :id")
    void zerarFalhasDeSenha(@Param("id") Integer id);
}
