package br.com.istoque.services;

import br.com.istoque.dto.LoginRequestDTO;
import br.com.istoque.dto.LoginResponseDTO;
import br.com.istoque.exception.CredenciaisInvalidasException;
import br.com.istoque.infrastructure.entity.Permissao;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.util.EmailUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final BloqueioDeLoginService bloqueioDeLoginService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       BloqueioDeLoginService bloqueioDeLoginService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.bloqueioDeLoginService = bloqueioDeLoginService;
    }

    @Transactional
    public LoginResponseDTO realizarLogin(LoginRequestDTO loginRequest) {
        // o e-mail é único no sistema todo, então ele sozinho identifica a conta;
        // ele é gravado em minúsculas, então a busca também normaliza o digitado
        Usuario usuario = usuarioRepository
                .findByEmail(EmailUtils.normalizar(loginRequest.email()))
                .orElseThrow(CredenciaisInvalidasException::new);

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            throw new CredenciaisInvalidasException();
        }

        bloqueioDeLoginService.exigirNaoBloqueado(usuario);

        if (!passwordEncoder.matches(loginRequest.senha(), usuario.getSenha())) {
            bloqueioDeLoginService.registrarFalha(usuario);
            throw new CredenciaisInvalidasException();
        }

        bloqueioDeLoginService.registrarAcerto(usuario);
        usuarioRepository.registrarAcesso(usuario.getId(), OffsetDateTime.now());

        String nomeDaEmpresa = usuario.getEmpresa().getNomeFantasia() != null
                ? usuario.getEmpresa().getNomeFantasia()
                : usuario.getEmpresa().getRazaoSocial();

        JwtService.TokenGerado token = jwtService.gerarToken(
                usuario.getEmail(),
                usuario.getId(),
                usuario.getEmpresa().getId(),
                usuario.getPerfil().getNome(),
                usuario.getTokenVersao());

        return new LoginResponseDTO(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getPerfil().getNome(),
                usuario.getEmpresa().getId(),
                nomeDaEmpresa,
                token.token(),
                token.expiraEm(),
                usuario.getPerfil().getPermissoes().stream().map(Permissao::getCodigo).sorted().toList());
    }
}
