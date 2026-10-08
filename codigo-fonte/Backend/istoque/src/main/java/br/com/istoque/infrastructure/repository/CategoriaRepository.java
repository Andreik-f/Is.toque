package br.com.istoque.infrastructure.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.istoque.infrastructure.entity.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    List<Categoria> findByEmpresaIdOrderByNome(Integer empresaId);
    Optional<Categoria> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
