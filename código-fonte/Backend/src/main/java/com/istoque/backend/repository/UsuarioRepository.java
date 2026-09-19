package com.istoque.backend.repository;

import com.istoque.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    
   Optional<Usuario> findByEmailAndEmpresaCnpj(String email, String cnpj);
    
}