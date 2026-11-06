package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    Optional<Produto> findByIdAndEmpresaId(Integer id, Integer empresaId);

    List<Produto> findByEmpresaIdOrderByNome(Integer empresaId);

    List<Produto> findByEmpresaIdAndAtivoTrueOrderByNome(Integer empresaId);

    List<Produto> findByEmpresaIdAndAtivoFalseOrderByNome(Integer empresaId);

}
