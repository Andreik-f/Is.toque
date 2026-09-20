package com.istoque.backend.service;

import com.istoque.backend.dto.LoginRequestDTO;
import com.istoque.backend.dto.LoginResponseDTO;
import com.istoque.backend.exception.CredenciaisInvalidasException;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public LoginResponseDTO realizarLogin(LoginRequestDTO loginRequest) {
        Usuario usuario = usuarioRepository
                .findByEmailAndEmpresaCnpj(loginRequest.email(), loginRequest.cnpj())
                .orElseThrow(CredenciaisInvalidasException::new);

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            throw new CredenciaisInvalidasException();
        }

        if (!passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
            throw new CredenciaisInvalidasException();
        }

        usuario.setUltimoAcesso(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        String nomeDaEmpresa = usuario.getEmpresa().getNomeFantasia() != null
                ? usuario.getEmpresa().getNomeFantasia()
                : usuario.getEmpresa().getRazaoSocial();

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                usuario.getEmpresa().getId(),
                nomeDaEmpresa);
    }
}