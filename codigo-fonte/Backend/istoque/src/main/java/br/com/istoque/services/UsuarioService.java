package br.com.istoque.services;

import br.com.istoque.dto.TrocarSenhaPropriaRequestDTO;
import br.com.istoque.dto.UsuarioCreateDTO;
import br.com.istoque.dto.UsuarioResponseDTO;
import br.com.istoque.dto.UsuarioUpdateDTO;
import br.com.istoque.exception.EmailJaCadastradoException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.exception.OperacaoNaoPermitidaException;
import br.com.istoque.exception.PerfilNaoEncontradoException;
import br.com.istoque.exception.SenhaAtualIncorretaException;
import br.com.istoque.exception.UsuarioNaoEncontradoException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Permissao;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.security.Autorizacao;
import br.com.istoque.util.EmailUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PerfilRepository perfilRepository;
    private final PasswordEncoder passwordEncoder;
    private final Autorizacao autorizacao;

    public UsuarioService(UsuarioRepository usuarioRepository,
                           EmpresaRepository empresaRepository,
                           PerfilRepository perfilRepository,
                           PasswordEncoder passwordEncoder,
                           Autorizacao autorizacao) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
        this.autorizacao = autorizacao;
    }

    public UsuarioResponseDTO criar(UsuarioCreateDTO dto, Integer empresaId) {
        return criar(dto, empresaId, true);
    }

    // no cadastro ainda não há usuário logado: o primeiro administrador nasce com o perfil completo
    UsuarioResponseDTO criarAdministradorDoCadastro(UsuarioCreateDTO dto, Integer empresaId) {
        return criar(dto, empresaId, false);
    }

    private UsuarioResponseDTO criar(UsuarioCreateDTO dto, Integer empresaId, boolean exigirPermissoesDoPerfil) {
        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(empresaId));

        Perfil perfil = perfilRepository.findByIdAndEmpresaId(dto.perfilId(), empresa.getId())
                .orElseThrow(() -> new PerfilNaoEncontradoException(dto.perfilId()));
        if (exigirPermissoesDoPerfil) {
            exigirPermissoesDoPerfil(perfil);
        }

        String email = EmailUtils.normalizar(dto.email());
        if (usuarioRepository.existsByEmail(email)) {
            throw new EmailJaCadastradoException(email);
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        return UsuarioResponseDTO.fromEntity(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO atualizar(Integer id, UsuarioUpdateDTO dto, Integer empresaId) {
        Usuario usuario = buscarUsuario(id, empresaId);

        Perfil perfil = perfilRepository.findByIdAndEmpresaId(dto.perfilId(), empresaId)
                .orElseThrow(() -> new PerfilNaoEncontradoException(dto.perfilId()));

        exigirPermissoesDoPerfil(perfil);
        exigirPermissoesDoPerfil(usuario.getPerfil());

        if (!autorizacao.ehAdministrador(perfil.getNome()) && ehUltimoAdministradorAtivo(usuario)) {
            throw new OperacaoNaoPermitidaException(
                    "Não é possível alterar o perfil do último administrador ativo da empresa.");
        }

        String email = EmailUtils.normalizar(dto.email());
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new EmailJaCadastradoException(email);
        }

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setPerfil(perfil);

        return UsuarioResponseDTO.fromEntity(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarPorEmpresa(Integer empresaId) {
        return usuarioRepository.findByEmpresaIdOrderByNome(empresaId).stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();
    }

    public void alterarSenha(Integer id, String novaSenha, Integer empresaId) {
        Usuario usuario = buscarUsuario(id, empresaId);
        exigirPermissoesDoPerfil(usuario.getPerfil());
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    public void inativarUsuario(Integer id, Integer empresaId, Integer usuarioLogadoId) {
        Usuario usuario = buscarUsuario(id, empresaId);
        exigirPermissoesDoPerfil(usuario.getPerfil());
        if (usuario.getId().equals(usuarioLogadoId)) {
            throw new OperacaoNaoPermitidaException("Você não pode inativar o seu próprio usuário.");
        }
        if (ehUltimoAdministradorAtivo(usuario)) {
            throw new OperacaoNaoPermitidaException(
                    "Não é possível inativar o último administrador ativo da empresa.");
        }
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }

    // quem gerencia usuários não pode dar a ninguém, nem a si, um perfil com mais permissões que as dele
    private void exigirPermissoesDoPerfil(Perfil perfil) {
        autorizacao.exigirTodas(perfil.getPermissoes().stream().map(Permissao::getCodigo).toList());
    }

    private Usuario buscarUsuario(Integer id, Integer empresaId) {
        return usuarioRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));
    }

    private boolean ehUltimoAdministradorAtivo(Usuario usuario) {
        return Boolean.TRUE.equals(usuario.getAtivo())
                && autorizacao.ehAdministrador(usuario.getPerfil().getNome())
                && usuarioRepository.countByEmpresaIdAndPerfilNomeAndAtivoTrue(
                        usuario.getEmpresa().getId(), autorizacao.perfilAdministrador()) <= 1;
    }

    public void trocarSenhaPropria(Integer usuarioId, TrocarSenhaPropriaRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(usuarioId));

        if (!passwordEncoder.matches(dto.senhaAtual(), usuario.getSenha())) {
            throw new SenhaAtualIncorretaException("Senha atual incorreta.");
        }

        if (passwordEncoder.matches(dto.novaSenha(), usuario.getSenha())) {
            throw new SenhaAtualIncorretaException("A nova senha não pode ser igual à atual.");
        }

        usuario.setSenha(passwordEncoder.encode(dto.novaSenha()));
        usuarioRepository.save(usuario);
    }
}
