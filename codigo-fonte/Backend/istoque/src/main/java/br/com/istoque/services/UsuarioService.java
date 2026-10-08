package br.com.istoque.services;

import br.com.istoque.dto.UsuarioCreateDTO;
import br.com.istoque.dto.UsuarioResponseDTO;
import br.com.istoque.dto.UsuarioUpdateDTO;
import br.com.istoque.exception.EmailJaCadastradoException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.exception.PerfilNaoEncontradoException;
import br.com.istoque.exception.UsuarioNaoEncontradoException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.Perfil;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.PerfilRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
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

    public UsuarioService(UsuarioRepository usuarioRepository,
                           EmpresaRepository empresaRepository,
                           PerfilRepository perfilRepository,
                           PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.perfilRepository = perfilRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UsuarioResponseDTO criar(UsuarioCreateDTO dto) {
        Empresa empresa = empresaRepository.findById(dto.empresaId())
                .orElseThrow(() -> new EmpresaNaoEncontradaException(dto.empresaId()));

        Perfil perfil = perfilRepository.findByIdAndEmpresaId(dto.perfilId(), empresa.getId())
                .orElseThrow(() -> new PerfilNaoEncontradoException(dto.perfilId()));

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

    public UsuarioResponseDTO atualizar(Integer id, UsuarioUpdateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));

        Empresa empresa = empresaRepository.findById(dto.empresaId())
                .orElseThrow(() -> new EmpresaNaoEncontradaException(dto.empresaId()));

        Perfil perfil = perfilRepository.findByIdAndEmpresaId(dto.perfilId(), empresa.getId())
                .orElseThrow(() -> new PerfilNaoEncontradoException(dto.perfilId()));

        String email = EmailUtils.normalizar(dto.email());
        if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
            throw new EmailJaCadastradoException(email);
        }

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);

        return UsuarioResponseDTO.fromEntity(usuarioRepository.saveAndFlush(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponseDTO::fromEntity)
                .toList();
    }

    public void alterarSenha(Integer id, String novaSenha) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);
    }

    public void inativarUsuario(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));
        usuario.setAtivo(false);
        usuarioRepository.save(usuario);
    }
}
