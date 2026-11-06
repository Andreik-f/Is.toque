package br.com.istoque.services;

import br.com.istoque.dto.CadastroRequestDTO;
import br.com.istoque.dto.CadastroResponseDTO;
import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.dto.UsuarioCreateDTO;
import br.com.istoque.dto.UsuarioResponseDTO;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CadastroService {

    private final EmpresaService empresaService;
    private final UsuarioService usuarioService;
    private final PerfilRepository perfilRepository;
    private final JwtService jwtService;

    public CadastroService(EmpresaService empresaService,
                           UsuarioService usuarioService,
                           PerfilRepository perfilRepository,
                           JwtService jwtService) {
        this.empresaService = empresaService;
        this.usuarioService = usuarioService;
        this.perfilRepository = perfilRepository;
        this.jwtService = jwtService;
    }

    /**
     * Cria a empresa (com os perfis padrão) e o administrador dela na mesma
     * transação: se o usuário falhar (por exemplo, e-mail já cadastrado), a
     * empresa também não é gravada. Já devolve o token, para o usuário entrar
     * logado logo após o cadastro.
     */
    @Transactional
    public CadastroResponseDTO cadastrar(CadastroRequestDTO dto) {
        EmpresaResponseDTO empresa = empresaService.criar(
                new EmpresaRequestDTO(dto.razaoSocial(), null, dto.cnpj(), null, dto.telefone(), null));

        Perfil administrador = perfilRepository
                .findByNomeAndEmpresaId(PerfilService.ADMINISTRADOR, empresa.id())
                .orElseThrow();

        UsuarioResponseDTO usuario = usuarioService.criarAdministradorDoCadastro(
                new UsuarioCreateDTO(dto.nome(), dto.email(), dto.senha(), administrador.getId()), empresa.id());

        JwtService.TokenGerado token = jwtService.gerarToken(
                usuario.email(), usuario.id(), empresa.id(), administrador.getNome(), 0);

        return new CadastroResponseDTO(empresa, usuario, token.token(), token.expiraEm());
    }
}
