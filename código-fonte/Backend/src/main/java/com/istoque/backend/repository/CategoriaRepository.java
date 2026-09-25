package com.istoque.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.istoque.backend.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {
    Optional<Categoria> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
