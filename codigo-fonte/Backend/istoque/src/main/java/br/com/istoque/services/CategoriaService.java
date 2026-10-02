package br.com.istoque.services;

import br.com.istoque.dto.CategoriaRequestDTO;
import br.com.istoque.dto.CategoriaResponseDTO;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Categoria;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.repository.CategoriaRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final EmpresaRepository empresaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository, EmpresaRepository empresaRepository) {
        this.categoriaRepository = categoriaRepository;
        this.empresaRepository = empresaRepository;
    }

    // cada empresa só enxerga as próprias categorias
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarPorEmpresa(Integer empresaId) {
        buscarEmpresa(empresaId);
        return categoriaRepository.findByEmpresaIdOrderByNome(empresaId).stream()
                .map(CategoriaResponseDTO::fromEntity)
                .toList();
    }

    public CategoriaResponseDTO criar(CategoriaRequestDTO dto) {
        Categoria categoria = new Categoria();
        categoria.setEmpresa(buscarEmpresa(dto.empresaId()));
        categoria.setNome(dto.nome());
        categoria.setDescricao(dto.descricao());
        return CategoriaResponseDTO.fromEntity(categoriaRepository.save(categoria));
    }

    private Empresa buscarEmpresa(Integer empresaId) {
        return empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(empresaId));
    }
}
