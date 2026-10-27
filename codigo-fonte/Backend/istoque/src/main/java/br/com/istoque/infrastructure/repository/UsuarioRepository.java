package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByIdAndEmpresaId(Integer id, Integer empresaId);

    List<Usuario> findByEmpresaIdOrderByNome(Integer empresaId);

    long countByEmpresaIdAndPerfilNomeAndAtivoTrue(Integer empresaId, String perfilNome);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Integer id);

    // update direto, sem passar pelo @PreUpdate: registrar um acesso não é
    // uma alteração no cadastro, então não pode mudar o atualizadoEm
    @Modifying
    @Query("update Usuario u set u.ultimoAcesso = :agora where u.id = :id")
    void registrarAcesso(@Param("id") Integer id, @Param("agora") OffsetDateTime agora);
}
