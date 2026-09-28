package br.com.istoque.controller;

import br.com.istoque.dto.CategoriaRequestDTO;
import br.com.istoque.dto.CategoriaResponseDTO;
import br.com.istoque.services.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

// A empresa vem por parâmetro (ou no corpo) até o isolamento por empresa
// (HT002) passar a usar a empresa do usuário autenticado.
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    public CategoriaController(CategoriaService categoriaService) {
        this.categoriaService = categoriaService;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar(@RequestParam Integer empresaId) {
        return ResponseEntity.ok(categoriaService.listarPorEmpresa(empresaId));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> criar(@RequestBody @Valid CategoriaRequestDTO dto) {
        CategoriaResponseDTO criada = categoriaService.criar(dto);
        return ResponseEntity
                .created(URI.create("/api/categorias/" + criada.id()))
                .body(criada);
    }
}
