package br.com.istoque.services;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PerfilService {

    private final PerfilRepository perfilRepository;

    public PerfilService(PerfilRepository perfilRepository) {
        this.perfilRepository = perfilRepository;
    }

    /**
     * Cria os perfis padrão que a empresa ainda não tiver. Pode ser chamado de
     * novo para a mesma empresa sem duplicar nada, e é isso que permite ao
     * PerfilSeeder rodar a cada inicialização.
     */
    public void criarPerfisPadrao(Empresa empresa) {
        criarSeNaoExistir(empresa, "Administrador", "Acesso total ao sistema da empresa");
        criarSeNaoExistir(empresa, "Gerente", "Gerencia estoque, receitas e produção");
        criarSeNaoExistir(empresa, "Funcionário", "Registra movimentações de estoque");
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
