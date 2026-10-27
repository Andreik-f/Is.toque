package br.com.istoque.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.istoque.infrastructure.entity.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {
    List<Perfil> findByEmpresaIdOrderById(Integer empresaId);
    Optional<Perfil> findByNomeAndEmpresaId(String nome, Integer empresaId);
    Optional<Perfil> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
