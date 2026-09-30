package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {

    Optional<Usuario> findByEmailAndEmpresaCnpj(String email, String cnpj);

    boolean existsByEmpresaIdAndEmail(Integer empresaId, String email);

    boolean existsByEmpresaIdAndEmailAndIdNot(Integer empresaId, String email, Integer id);
}
