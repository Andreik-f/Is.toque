package br.com.istoque.controller;

import br.com.istoque.dto.CadastroRequestDTO;
import br.com.istoque.dto.CadastroResponseDTO;
import br.com.istoque.dto.LoginRequestDTO;
import br.com.istoque.dto.LoginResponseDTO;
import br.com.istoque.dto.RecuperarSenhaRequestDTO;
import br.com.istoque.dto.RedefinirSenhaRequestDTO;
import br.com.istoque.services.AuthService;
import br.com.istoque.services.CadastroService;
import br.com.istoque.services.RecuperacaoSenhaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CadastroService cadastroService;
    private final RecuperacaoSenhaService recuperacaoSenhaService;

    public AuthController(AuthService authService, CadastroService cadastroService,
                          RecuperacaoSenhaService recuperacaoSenhaService) {
        this.authService = authService;
        this.cadastroService = cadastroService;
        this.recuperacaoSenhaService = recuperacaoSenhaService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO loginRequest) {
        return ResponseEntity.ok(authService.realizarLogin(loginRequest));
    }

    // tela de cadastro: cria a empresa e o administrador dela juntos
    @PostMapping("/cadastro")
    public ResponseEntity<CadastroResponseDTO> cadastrar(@Valid @RequestBody CadastroRequestDTO dto) {
        CadastroResponseDTO cadastro = cadastroService.cadastrar(dto);
        return ResponseEntity
                .created(URI.create("/api/empresas/minha"))
                .body(cadastro);
    }

    // 204 exista ou não o e-mail: a resposta não revela quais contas existem
    @PostMapping("/recuperar-senha")
    public ResponseEntity<Void> pedirCodigoDeRecuperacao(@Valid @RequestBody RecuperarSenhaRequestDTO dto) {
        recuperacaoSenhaService.enviarCodigo(dto.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/recuperar-senha/confirmar")
    public ResponseEntity<Void> redefinirSenha(@Valid @RequestBody RedefinirSenhaRequestDTO dto) {
        recuperacaoSenhaService.confirmar(dto.email(), dto.codigo(), dto.novaSenha());
        return ResponseEntity.noContent().build();
    }
}
