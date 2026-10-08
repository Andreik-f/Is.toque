package br.com.istoque.controller;

import br.com.istoque.dto.UnidadeMedidaResponseDTO;
import br.com.istoque.services.UnidadeMedidaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/unidades-medida")
public class UnidadeMedidaController {

    private final UnidadeMedidaService unidadeMedidaService;

    public UnidadeMedidaController(UnidadeMedidaService unidadeMedidaService) {
        this.unidadeMedidaService = unidadeMedidaService;
    }

    @GetMapping
    public ResponseEntity<List<UnidadeMedidaResponseDTO>> listar() {
        return ResponseEntity.ok(unidadeMedidaService.listarTodas());
    }
}
