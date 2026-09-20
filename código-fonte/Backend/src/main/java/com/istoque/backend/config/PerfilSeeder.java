package com.istoque.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.Perfil;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.PerfilRepository;

@Component
public class PerfilSeeder implements CommandLineRunner {

    private final PerfilRepository perfilRepository;
    private final EmpresaRepository empresaRepository;

    public PerfilSeeder(PerfilRepository perfilRepository, EmpresaRepository empresaRepository) {
        this.perfilRepository = perfilRepository;
        this.empresaRepository = empresaRepository;
    }

    @Override
    public void run(String... args) {
        for (Empresa empresa : empresaRepository.findAll()) {
            criarSeNaoExistir(empresa, "Administrador", "Acesso total ao sistema da empresa");
            criarSeNaoExistir(empresa, "Gerente", "Gerencia estoque, receitas e produção");
            criarSeNaoExistir(empresa, "Funcionário", "Registra movimentações de estoque");
        }
    }

    private void criarSeNaoExistir(Empresa empresa, String nome, String descricao) {
        if (perfilRepository.findByNomeAndEmpresaId(nome, empresa.getId()).isEmpty()) {
            perfilRepository.save(new Perfil(nome, descricao, empresa));
        }
    }

}
