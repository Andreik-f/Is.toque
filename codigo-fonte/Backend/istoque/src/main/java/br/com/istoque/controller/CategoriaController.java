package br.com.istoque.controller;

import br.com.istoque.dto.CategoriaRequestDTO;
import br.com.istoque.dto.CategoriaResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.CategoriaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;

    private final UsuarioLogado usuarioLogado;

    public CategoriaController(CategoriaService categoriaService, UsuarioLogado usuarioLogado) {
        this.categoriaService = categoriaService;
        this.usuarioLogado = usuarioLogado;
    }

    @GetMapping
    public ResponseEntity<List<CategoriaResponseDTO>> listar() {
        return ResponseEntity.ok(categoriaService.listarPorEmpresa(usuarioLogado.empresaId()));
    }

    @PostMapping
    public ResponseEntity<CategoriaResponseDTO> criar(@RequestBody @Valid CategoriaRequestDTO dto) {
        CategoriaResponseDTO criada = categoriaService.criar(dto, usuarioLogado.empresaId());
        return ResponseEntity
                .created(URI.create("/api/categorias/" + criada.id()))
                .body(criada);
    }
}
