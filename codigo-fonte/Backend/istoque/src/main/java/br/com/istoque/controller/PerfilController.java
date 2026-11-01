package br.com.istoque.controller;

import br.com.istoque.dto.PerfilRequestDTO;
import br.com.istoque.dto.PerfilResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.PerfilService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
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

    @PostMapping
    public ResponseEntity<PerfilResponseDTO> criar(@RequestBody @Valid PerfilRequestDTO dto) {
        PerfilResponseDTO criado = perfilService.criar(dto, usuarioLogado.empresaId());
        return ResponseEntity
                .created(URI.create("/api/perfis/" + criado.id()))
                .body(criado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerfilResponseDTO> atualizar(@PathVariable Integer id,
            @RequestBody @Valid PerfilRequestDTO dto) {
        return ResponseEntity.ok(perfilService.atualizar(id, dto, usuarioLogado.empresaId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        perfilService.excluir(id, usuarioLogado.empresaId());
        return ResponseEntity.noContent().build();
    }
}
