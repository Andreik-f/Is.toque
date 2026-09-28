package br.com.istoque.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.services.PerfilService;

/**
 * Empresas novas já ganham os perfis padrão no EmpresaService.criar. Este
 * seeder completa, a cada inicialização, as que foram criadas antes disso ou
 * direto no banco.
 */
@Component
public class PerfilSeeder implements CommandLineRunner {

    private final EmpresaRepository empresaRepository;
    private final PerfilService perfilService;

    public PerfilSeeder(EmpresaRepository empresaRepository, PerfilService perfilService) {
        this.empresaRepository = empresaRepository;
        this.perfilService = perfilService;
    }

    @Override
    public void run(String... args) {
        for (Empresa empresa : empresaRepository.findAll()) {
            perfilService.criarPerfisPadrao(empresa);
        }
    }

}
