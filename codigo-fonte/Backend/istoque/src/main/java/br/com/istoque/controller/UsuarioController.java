package br.com.istoque.controller;

import br.com.istoque.dto.TrocaSenhaRequestDTO;
import br.com.istoque.dto.TrocarSenhaPropriaRequestDTO;
import br.com.istoque.dto.UsuarioCreateDTO;
import br.com.istoque.dto.UsuarioResponseDTO;
import br.com.istoque.dto.UsuarioUpdateDTO;
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

    public UsuarioController(UsuarioService usuarioService, UsuarioLogado usuarioLogado) {
        this.usuarioService = usuarioService;
        this.usuarioLogado = usuarioLogado;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> criar(@RequestBody @Valid UsuarioCreateDTO dto) {
        UsuarioResponseDTO criado = usuarioService.criar(dto);
        return ResponseEntity
                .created(URI.create("/api/usuarios/" + criado.id()))
                .body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> atualizar(@PathVariable Integer id,
            @RequestBody @Valid UsuarioUpdateDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizar(id, dto));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(
           @PathVariable Integer id,
           @RequestBody @Valid TrocaSenhaRequestDTO dto) {
       usuarioService.alterarSenha(id, dto.novaSenha());
        return ResponseEntity.noContent().build();
     }

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        usuarioService.inativarUsuario(id);
        return ResponseEntity.noContent().build();
    }

    // O usuário vem do token, não da URL: cada um só troca a própria senha
    @PatchMapping("/me/senha")
    public ResponseEntity<Void> trocarMinhaSenha(@RequestBody @Valid TrocarSenhaPropriaRequestDTO dto) {
        usuarioService.trocarSenhaPropria(usuarioLogado.id(), dto);
        return ResponseEntity.noContent().build();
    }
}
