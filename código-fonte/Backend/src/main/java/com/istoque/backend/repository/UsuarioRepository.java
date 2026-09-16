package com.istoque.backend.repository;

import com.istoque.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // Ler nome do método e cria comndo no sql
    Optional<Usuario> findByEmail(String email);
    
}