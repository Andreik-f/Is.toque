package br.com.istoque.controller;

import br.com.istoque.dto.TrocaSenhaRequestDTO;
import br.com.istoque.dto.TrocarSenhaPropriaRequestDTO;
import br.com.istoque.dto.UsuarioCreateDTO;
import br.com.istoque.dto.UsuarioResponseDTO;
import br.com.istoque.dto.UsuarioUpdateDTO;
import br.com.istoque.security.Autorizacao;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    private final UsuarioLogado usuarioLogado;

    private final Autorizacao autorizacao;

    public UsuarioController(UsuarioService usuarioService, UsuarioLogado usuarioLogado, Autorizacao autorizacao) {
        this.usuarioService = usuarioService;
        this.usuarioLogado = usuarioLogado;
        this.autorizacao = autorizacao;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@RequestBody @Valid UsuarioCreateDTO dto) {
        autorizacao.exigirAdministrador();
        UsuarioResponseDTO criado = usuarioService.criar(dto, usuarioLogado.empresaId());
        return ResponseEntity
                .created(URI.create("/api/usuarios/" + criado.id()))
                .body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Integer id,
            @RequestBody @Valid UsuarioUpdateDTO dto) {
        autorizacao.exigirAdministrador();
        return ResponseEntity.ok(usuarioService.atualizar(id, dto, usuarioLogado.empresaId()));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(
           @PathVariable Integer id,
           @RequestBody @Valid TrocaSenhaRequestDTO dto) {
       autorizacao.exigirAdministrador();
       usuarioService.alterarSenha(id, dto.novaSenha(), usuarioLogado.empresaId());
        return ResponseEntity.noContent().build();
     }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarPorEmpresa(usuarioLogado.empresaId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        autorizacao.exigirAdministrador();
        usuarioService.inativarUsuario(id, usuarioLogado.empresaId(), usuarioLogado.id());
        return ResponseEntity.noContent().build();
    }

    // O usuário vem do token, não da URL: cada um só troca a própria senha
    @PatchMapping("/me/senha")
    public ResponseEntity<Void> trocarMinhaSenha(@RequestBody @Valid TrocarSenhaPropriaRequestDTO dto) {
        usuarioService.trocarSenhaPropria(usuarioLogado.id(), dto);
        return ResponseEntity.noContent().build();
    }
}
