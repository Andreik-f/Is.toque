package br.com.istoque.controller;

import br.com.istoque.dto.PermissaoResponseDTO;
import br.com.istoque.services.PerfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/permissoes")
public class PermissaoController {

    private final PerfilService perfilService;

    public PermissaoController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<List<PermissaoResponseDTO>> listar() {
        return ResponseEntity.ok(perfilService.listarPermissoes());
    }
}
