package br.com.istoque.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.istoque.infrastructure.entity.UnidadeMedida;

public interface UnidadeMedidaRepository extends JpaRepository<UnidadeMedida, Integer> {
}
