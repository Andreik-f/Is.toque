package br.com.istoque.infrastructure.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.istoque.infrastructure.entity.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {
    Optional<Perfil> findByNomeAndEmpresaId(String nome, Integer empresaId);
    Optional<Perfil> findByIdAndEmpresaId(Integer id, Integer empresaId);
    void deleteByEmpresaId(Integer empresaId);
}
