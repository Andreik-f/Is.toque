package br.com.istoque.controller;

import br.com.istoque.dto.PerfilResponseDTO;
import br.com.istoque.services.PerfilService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// A empresa vem por parâmetro até o isolamento por empresa (HT002) passar a
// usar a empresa do usuário autenticado.
@RestController
@RequestMapping("/api/perfis")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public ResponseEntity<List<PerfilResponseDTO>> listar(@RequestParam Integer empresaId) {
        return ResponseEntity.ok(perfilService.listarPorEmpresa(empresaId));
    }
}
