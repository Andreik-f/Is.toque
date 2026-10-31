package br.com.istoque.controller;

import br.com.istoque.dto.ReceitaRequestDTO;
import br.com.istoque.dto.ReceitaResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.ReceitaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

// A empresa vem sempre do usuário autenticado, nunca da URL ou do corpo
@RestController
@RequestMapping("/api/receitas")
public class ReceitaController {

    private final ReceitaService receitaService;
    private final UsuarioLogado usuarioLogado;

    public ReceitaController(ReceitaService receitaService, UsuarioLogado usuarioLogado) {
        this.receitaService = receitaService;
        this.usuarioLogado = usuarioLogado;
    }

    @GetMapping
    public ResponseEntity<List<ReceitaResponseDTO>> listar() {
        return ResponseEntity.ok(receitaService.listar(usuarioLogado.empresaId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceitaResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(receitaService.buscarPorId(id, usuarioLogado.empresaId()));
    }

    @PostMapping
    public ResponseEntity<ReceitaResponseDTO> cadastrar(@RequestBody @Valid ReceitaRequestDTO dto) {
        ReceitaResponseDTO criada = receitaService.cadastrar(dto, usuarioLogado.empresaId());
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(criada.id()).toUri();
        return ResponseEntity.created(uri).body(criada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ReceitaResponseDTO> atualizar(@PathVariable Integer id,
                                                        @RequestBody @Valid ReceitaRequestDTO dto) {
        return ResponseEntity.ok(receitaService.atualizar(id, dto, usuarioLogado.empresaId()));
    }

    @PatchMapping("/{id}/desativar")
    public ResponseEntity<Void> desativar(@PathVariable Integer id) {
        receitaService.desativar(id, usuarioLogado.empresaId());
        return ResponseEntity.noContent().build();
    }
}
