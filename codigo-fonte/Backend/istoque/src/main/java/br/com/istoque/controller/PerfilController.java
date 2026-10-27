package br.com.istoque.controller;

import br.com.istoque.dto.PerfilResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.PerfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/perfis")
public class PerfilController {

    private final PerfilService perfilService;

    private final UsuarioLogado usuarioLogado;

    public PerfilController(PerfilService perfilService, UsuarioLogado usuarioLogado) {
        this.perfilService = perfilService;
        this.usuarioLogado = usuarioLogado;
    }

    @GetMapping
    public ResponseEntity<List<PerfilResponseDTO>> listar() {
        return ResponseEntity.ok(perfilService.listarPorEmpresa(usuarioLogado.empresaId()));
    }
}
