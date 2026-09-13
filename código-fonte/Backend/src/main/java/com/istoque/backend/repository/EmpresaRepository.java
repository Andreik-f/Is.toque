package com.istoque.backend.repository;

import com.istoque.backend.model.Empresa;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {

    Optional<Empresa> findByCnpj(String cnpj);

    boolean existsByCnpj(String cnpj);

}
