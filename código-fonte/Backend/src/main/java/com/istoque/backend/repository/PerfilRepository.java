package com.istoque.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.istoque.backend.model.Perfil;

public interface PerfilRepository extends JpaRepository<Perfil, Integer> {
    Optional<Perfil> findByNomeAndEmpresaId(String nome, Integer empresaId);
    Optional<Perfil> findByIdAndEmpresaId(Integer id, Integer empresaId);
}
