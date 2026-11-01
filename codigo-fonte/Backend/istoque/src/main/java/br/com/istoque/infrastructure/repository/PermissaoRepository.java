package br.com.istoque.infrastructure.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import br.com.istoque.infrastructure.entity.Permissao;

public interface PermissaoRepository extends JpaRepository<Permissao, String> {
}
