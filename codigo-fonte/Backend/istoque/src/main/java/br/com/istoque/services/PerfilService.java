package br.com.istoque.services;

import br.com.istoque.dto.PerfilRequestDTO;
import br.com.istoque.dto.PerfilResponseDTO;
import br.com.istoque.dto.PermissaoResponseDTO;
import br.com.istoque.exception.OperacaoNaoPermitidaException;
import br.com.istoque.exception.PerfilNaoEncontradoNaEmpresaException;
import br.com.istoque.exception.PermissaoInvalidaException;
import br.com.istoque.exception.PermissaoObrigatoriaDoAdministradorException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Permissao;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.PermissaoRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.security.Autorizacao;
import br.com.istoque.security.Permissoes;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class PerfilService {

    public static final String ADMINISTRADOR = "Administrador";

    private final PerfilRepository perfilRepository;
    private final PermissaoRepository permissaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final Autorizacao autorizacao;

    public PerfilService(PerfilRepository perfilRepository,
                         PermissaoRepository permissaoRepository,
                         UsuarioRepository usuarioRepository,
                         EmpresaRepository empresaRepository,
                         Autorizacao autorizacao) {
        this.perfilRepository = perfilRepository;
        this.permissaoRepository = permissaoRepository;
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.autorizacao = autorizacao;
    }

    /** Cria os perfis padrão com a matriz de permissões. Nunca altera um perfil que já existe. */
    public void criarPerfisPadrao(Empresa empresa) {
        criarSeNaoExistir(empresa, ADMINISTRADOR, "Acesso total ao sistema da empresa");
        criarSeNaoExistir(empresa, "Gerente", "Gerencia estoque, receitas e produção");
        criarSeNaoExistir(empresa, "Funcionário", "Registra movimentações de estoque");
    }

    @Transactional(readOnly = true)
    public List<PerfilResponseDTO> listarPorEmpresa(Integer empresaId) {
        return perfilRepository.findByEmpresaIdOrderById(empresaId).stream()
                .map(PerfilResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PermissaoResponseDTO> listarPermissoes() {
        return permissaoRepository.findAll(Sort.by("codigo")).stream()
                .map(PermissaoResponseDTO::fromEntity)
                .toList();
    }

    public PerfilResponseDTO criar(PerfilRequestDTO dto, Integer empresaId) {
        String nome = dto.nome().trim();
        Set<Permissao> permissoes = validarPermissoes(dto.permissoes());
        if (perfilRepository.existsByEmpresaIdAndNomeIgnoreCase(empresaId, nome)) {
            throw nomeRepetido(nome);
        }

        Perfil perfil = new Perfil(nome, dto.descricao(), empresaRepository.getReferenceById(empresaId));
        perfil.setPermissoes(permissoes);
        return PerfilResponseDTO.fromEntity(perfilRepository.save(perfil));
    }

    public PerfilResponseDTO atualizar(Integer id, PerfilRequestDTO dto, Integer empresaId) {
        Perfil perfil = buscar(id, empresaId);
        exigirPermissoesDoPerfil(perfil);
        String nome = dto.nome().trim();
        Set<Permissao> permissoes = validarPermissoes(dto.permissoes());
        if (perfilRepository.existsByEmpresaIdAndNomeIgnoreCaseAndIdNot(empresaId, nome, id)) {
            throw nomeRepetido(nome);
        }

        // o Administrador é identificado pelo nome, então não pode ser renomeado
        if (autorizacao.ehAdministrador(perfil.getNome())) {
            if (!dto.permissoes().containsAll(Set.of(Permissoes.USUARIOS_GERENCIAR, Permissoes.PERFIS_GERENCIAR))) {
                throw new PermissaoObrigatoriaDoAdministradorException(
                        "O Administrador precisa manter as permissões de gerenciar usuários e perfis.");
            }
            if (!perfil.getNome().equals(nome)) {
                throw new PermissaoObrigatoriaDoAdministradorException("O perfil Administrador não pode ser renomeado.");
            }
        }

        perfil.setNome(nome);
        perfil.setDescricao(dto.descricao());
        perfil.setPermissoes(permissoes);
        return PerfilResponseDTO.fromEntity(perfilRepository.saveAndFlush(perfil));
    }

    public void excluir(Integer id, Integer empresaId) {
        Perfil perfil = buscar(id, empresaId);
        exigirPermissoesDoPerfil(perfil);
        if (usuarioRepository.existsByPerfilId(id)) {
            throw new OperacaoNaoPermitidaException("Não é possível excluir um perfil que tem usuários.");
        }
        perfilRepository.delete(perfil);
    }

    // quem gerencia perfis não altera nem exclui um perfil com mais permissões que as dele
    private void exigirPermissoesDoPerfil(Perfil perfil) {
        autorizacao.exigirTodas(perfil.getPermissoes().stream().map(Permissao::getCodigo).toList());
    }

    private Perfil buscar(Integer id, Integer empresaId) {
        return perfilRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new PerfilNaoEncontradoNaEmpresaException(id));
    }

    private Set<Permissao> validarPermissoes(Set<String> codigos) {
        List<Permissao> encontradas = permissaoRepository.findAllById(codigos);
        if (encontradas.size() != codigos.size()) {
            Set<String> inexistentes = new HashSet<>(codigos);
            encontradas.forEach(p -> inexistentes.remove(p.getCodigo()));
            throw new PermissaoInvalidaException("Permissão inexistente: " + String.join(", ", inexistentes));
        }
        autorizacao.exigirTodas(codigos);
        return new HashSet<>(encontradas);
    }

    private OperacaoNaoPermitidaException nomeRepetido(String nome) {
        return new OperacaoNaoPermitidaException("Já existe um perfil com o nome \"" + nome + "\" nesta empresa.");
    }

    private void criarSeNaoExistir(Empresa empresa, String nome, String descricao) {
        if (perfilRepository.findByNomeAndEmpresaId(nome, empresa.getId()).isEmpty()) {
            Perfil perfil = new Perfil(nome, descricao, empresa);
            perfil.setPermissoes(new HashSet<>(permissaoRepository.findAllById(Permissoes.MATRIZ_PADRAO.get(nome))));
            perfilRepository.save(perfil);
        }
    }
}
