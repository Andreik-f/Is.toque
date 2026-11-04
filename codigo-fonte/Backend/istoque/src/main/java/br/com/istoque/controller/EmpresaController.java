package br.com.istoque.controller;

import br.com.istoque.dto.ConfirmarTelefoneRequestDTO;
import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.security.UsuarioLogado;
import br.com.istoque.services.ConfirmacaoTelefoneService;
import br.com.istoque.services.EmpresaService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    private final EmpresaService empresaService;

    private final ConfirmacaoTelefoneService confirmacaoTelefoneService;

    private final UsuarioLogado usuarioLogado;

    public EmpresaController(EmpresaService empresaService,
                             ConfirmacaoTelefoneService confirmacaoTelefoneService,
                             UsuarioLogado usuarioLogado) {
        this.empresaService = empresaService;
        this.confirmacaoTelefoneService = confirmacaoTelefoneService;
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

    @PostMapping("/minha/telefone/codigo")
    public ResponseEntity<Void> enviarCodigoDoTelefone() {
        confirmacaoTelefoneService.enviarCodigo(usuarioLogado.empresaId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/minha/telefone/confirmar")
    public ResponseEntity<Void> confirmarTelefone(@RequestBody @Valid ConfirmarTelefoneRequestDTO dto) {
        confirmacaoTelefoneService.confirmar(usuarioLogado.empresaId(), dto.codigo());
        return ResponseEntity.noContent().build();
    }

}
