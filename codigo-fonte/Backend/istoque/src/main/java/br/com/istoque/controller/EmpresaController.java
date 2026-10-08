package br.com.istoque.controller;

import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.dto.MensagemResponse;
import br.com.istoque.services.EmpresaService;

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
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    public EmpresaController(EmpresaService empresaService) {
        this.empresaService = empresaService;
    }

    @GetMapping
    public ResponseEntity<List<EmpresaResponseDTO>> listar() {
        return ResponseEntity.ok(empresaService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmpresaResponseDTO> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(empresaService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<EmpresaResponseDTO> criar(@RequestBody @Valid EmpresaRequestDTO dto) {
        EmpresaResponseDTO empresaCriada = empresaService.criar(dto);
        URI location = URI.create("/api/empresas/" + empresaCriada.id());
        return ResponseEntity.created(location).body(empresaCriada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmpresaResponseDTO> atualizar(
            @PathVariable Integer id,
            @RequestBody @Valid EmpresaRequestDTO dto
    ) {
        return ResponseEntity.ok(empresaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MensagemResponse> deletar(@PathVariable Integer id) {
        empresaService.deletar(id);
        return ResponseEntity.ok(new MensagemResponse("Empresa excluída com sucesso"));
    }

}
