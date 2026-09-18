package com.istoque.backend.service;

import com.istoque.backend.dto.LoginRequestDTO;
import com.istoque.backend.dto.LoginResponseDTO;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponseDTO realizarLogin(LoginRequestDTO loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndEmpresaCnpj(loginRequest.email(), loginRequest.cnpj());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // Compara a senha em texto com a senha criptografada (Hash)
            if (passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
                String nomeDaEmpresa = usuario.getEmpresa().getNomeFantasia() != null 
                        ? usuario.getEmpresa().getNomeFantasia() 
                        : usuario.getEmpresa().getRazaoSocial();

                return new LoginResponseDTO(
                        usuario.getId(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        String.valueOf(usuario.getPerfilId()),
                        usuario.getEmpresa().getId(),
                        nomeDaEmpresa
                );
            }
        }
        return null; 
    }
}