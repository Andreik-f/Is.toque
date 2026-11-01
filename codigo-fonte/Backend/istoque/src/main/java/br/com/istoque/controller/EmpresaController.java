package br.com.istoque.controller;

import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.EmpresaService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    private final UsuarioLogado usuarioLogado;

    public EmpresaController(EmpresaService empresaService, UsuarioLogado usuarioLogado) {
        this.empresaService = empresaService;
        this.usuarioLogado = usuarioLogado;
    }

    @GetMapping("/minha")
    public ResponseEntity<EmpresaResponseDTO> buscarMinha() {
        return ResponseEntity.ok(empresaService.buscarPorId(usuarioLogado.empresaId()));
    }

    @PutMapping("/minha")
    public ResponseEntity<EmpresaResponseDTO> atualizarMinha(@RequestBody @Valid EmpresaRequestDTO dto) {
        return ResponseEntity.ok(empresaService.atualizar(usuarioLogado.empresaId(), dto));
    }

}
