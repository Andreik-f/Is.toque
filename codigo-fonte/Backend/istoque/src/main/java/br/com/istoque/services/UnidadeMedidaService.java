package br.com.istoque.services;

import br.com.istoque.dto.UnidadeMedidaResponseDTO;
import br.com.istoque.infrastructure.repository.UnidadeMedidaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UnidadeMedidaService {

    private final UnidadeMedidaRepository unidadeMedidaRepository;

    public UnidadeMedidaService(UnidadeMedidaRepository unidadeMedidaRepository) {
        this.unidadeMedidaRepository = unidadeMedidaRepository;
    }

    // as unidades de medida são as mesmas para todas as empresas
    public List<UnidadeMedidaResponseDTO> listarTodas() {
        return unidadeMedidaRepository.findAllByOrderByNomeAscSiglaAsc().stream()
                .map(UnidadeMedidaResponseDTO::fromEntity)
                .toList();
    }
}
