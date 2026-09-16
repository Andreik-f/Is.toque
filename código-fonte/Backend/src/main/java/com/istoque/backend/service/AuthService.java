package com.istoque.backend.service;

import com.istoque.backend.dto.LoginRequestDTO;
import com.istoque.backend.dto.LoginResponseDTO;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;

    public AuthService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponseDTO realizarLogin(LoginRequestDTO loginRequest) {
        // 1. Busca o usuário pelo e-mail
       Optional<Usuario> usuarioOpt = usuarioRepository.findByEmailAndEmpresaCnpj(loginRequest.email(), loginRequest.cnpj());

        // 2. Se o usuário existir no banco...
        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            
            // 3. Confere se a senha digitada é igual à senha do banco
            if (usuario.getSenha().equals(loginRequest.senha())) {
                
                // Pega o nome da empresa para devolver ao front-end
                String nomeDaEmpresa = usuario.getEmpresa().getNomeFantasia() != null 
                        ? usuario.getEmpresa().getNomeFantasia() 
                        : usuario.getEmpresa().getRazaoSocial();

                // 4. Retorna o envelope de sucesso com os dados
                return new LoginResponseDTO(
                        usuario.getId(),
                        usuario.getNome(),
                        usuario.getEmail(),
                        usuario.getPerfil(),
                        usuario.getEmpresa().getId(),
                        nomeDaEmpresa
                );
            }
        }
        // Se a senha estiver errada ou o usuário não existir, retorna nulo
        return null; 
    }
}