package br.com.istoque.services;

import br.com.istoque.dto.LoginRequestDTO;
import br.com.istoque.dto.LoginResponseDTO;
import br.com.istoque.exception.CredenciaisInvalidasException;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.istoque.util.CnpjUtils;

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
                .findByEmailAndEmpresaCnpj(loginRequest.email(), CnpjUtils.formatar(loginRequest.cnpj()))
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
