package com.istoque.backend.controller;

import com.istoque.backend.dto.UsuarioCreateDTO;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<Usuario> criar(@RequestBody UsuarioCreateDTO dto) {
        return ResponseEntity.ok(usuarioService.criarUsuario(dto));
    }
    @PutMapping("/{id}")
    public ResponseEntity<Usuario> atualizar(@PathVariable Integer id, @RequestBody UsuarioCreateDTO dto) {
        return ResponseEntity.ok(usuarioService.atualizarUsuario(id, dto));
    }

    @PatchMapping("/{id}/senha")
    public ResponseEntity<Void> alterarSenha(@PathVariable Integer id, @RequestBody String novaSenha) {
        usuarioService.alterarSenha(id, novaSenha);
        return ResponseEntity.noContent().build();
    }
    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> inativar(@PathVariable Integer id) {
        usuarioService.inativarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}