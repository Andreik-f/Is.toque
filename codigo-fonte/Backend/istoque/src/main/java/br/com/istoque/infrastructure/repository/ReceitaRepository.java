package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Receita;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReceitaRepository extends JpaRepository<Receita, Integer> {

    // Traz itens e produtos na mesma consulta, para montar a resposta sem uma consulta por item
    @EntityGraph(attributePaths = {"itens", "itens.produto"})
    List<Receita> findAllByEmpresaIdOrderByNome(Integer empresaId);

    @EntityGraph(attributePaths = {"itens", "itens.produto"})
    Optional<Receita> findByIdAndEmpresaId(Integer id, Integer empresaId);

    // Regra do HT035: nome único só entre as ativas da mesma empresa
    boolean existsByNomeIgnoreCaseAndEmpresaIdAndAtivoTrue(String nome, Integer empresaId);
}
