package br.com.istoque.services;

import br.com.istoque.dto.PerfilResponseDTO;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PerfilService {

    public static final String ADMINISTRADOR = "Administrador";

    private final PerfilRepository perfilRepository;
    private final EmpresaRepository empresaRepository;

    public PerfilService(PerfilRepository perfilRepository, EmpresaRepository empresaRepository) {
        this.perfilRepository = perfilRepository;
        this.empresaRepository = empresaRepository;
    }

    /**
     * Cria os perfis padrão que a empresa ainda não tiver. Pode ser chamado de
     * novo para a mesma empresa sem duplicar nada, e é isso que permite ao
     * PerfilSeeder rodar a cada inicialização.
     */
    public void criarPerfisPadrao(Empresa empresa) {
        criarSeNaoExistir(empresa, ADMINISTRADOR, "Acesso total ao sistema da empresa");
        criarSeNaoExistir(empresa, "Gerente", "Gerencia estoque, receitas e produção");
        criarSeNaoExistir(empresa, "Funcionário", "Registra movimentações de estoque");
    }

    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarPorEmpresa(Integer empresaId) {
        if (!empresaRepository.existsById(empresaId)) {
            throw new EmpresaNaoEncontradaException(empresaId);
        }
        return perfilRepository.findByEmpresaIdOrderById(empresaId).stream()
                .map(PerfilResponseDTO::fromEntity)
                .toList();
    }

    public void excluirPerfisDaEmpresa(Empresa empresa) {
        perfilRepository.deleteByEmpresaId(empresa.getId());
    }

    private void criarSeNaoExistir(Empresa empresa, String nome, String descricao) {
        if (perfilRepository.findByNomeAndEmpresaId(nome, empresa.getId()).isEmpty()) {
            perfilRepository.save(new Perfil(nome, descricao, empresa));
        }
    }
}
