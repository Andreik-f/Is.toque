package br.com.istoque.infrastructure.repository;

import br.com.istoque.infrastructure.entity.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    List<Produto> findByAtivoTrue();

}
