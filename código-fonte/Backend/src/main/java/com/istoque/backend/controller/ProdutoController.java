package com.istoque.backend.controller;

import com.istoque.backend.dto.ProdutoRequestDTO;
import com.istoque.backend.dto.ProdutoResponseDTO;
import com.istoque.backend.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    // endpoint de cadastro
    @PostMapping
    public ResponseEntity<ProdutoResponseDTO> salvar(@RequestBody @Valid ProdutoRequestDTO dto) {
        ProdutoResponseDTO criado = produtoService.salvar(dto);
        return ResponseEntity
                .created(URI.create("/api/produtos/" + criado.id()))
                .body(criado);
    }

    // endpoint de listagem
    @GetMapping
    public ResponseEntity<List<ProdutoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(produtoService.listarTodos());
    }

    @GetMapping("/ativos")
    public ResponseEntity<List<ProdutoResponseDTO>> listarAtivos() {
        return ResponseEntity.ok(produtoService.listarAtivos());
    }

    // endpoint de busca pelo ID
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(produtoService.buscarPorId(id));
    }

    // endpoint de atualização
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoResponseDTO> atualizar(@PathVariable Integer id,
            @RequestBody @Valid ProdutoRequestDTO dto) {
        return ResponseEntity.ok(produtoService.atualizar(id, dto));
    }

    //endpoint para desativar
    @PatchMapping("/{id}/desativar")
    public ResponseEntity<ProdutoResponseDTO> desativar(@PathVariable Integer id) {
        return ResponseEntity.ok(produtoService.desativar(id));
    }
}
