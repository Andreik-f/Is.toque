package com.istoque.backend.service;

import com.istoque.backend.dto.UsuarioCreateDTO;
import com.istoque.backend.dto.UsuarioResponseDTO;
import com.istoque.backend.exception.EmailJaCadastradoException;
import com.istoque.backend.exception.EmpresaNaoEncontradaException;
import com.istoque.backend.exception.PerfilNaoEncontradoException;
import com.istoque.backend.exception.UsuarioNaoEncontradoException;
import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.Perfil;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.PerfilRepository;
import com.istoque.backend.repository.UsuarioRepository;
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

        if (usuarioRepository.existsByEmpresaIdAndEmail(empresa.getId(), dto.email())) {
            throw new EmailJaCadastradoException(dto.email());
        }

        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setEmpresa(empresa);
        usuario.setPerfil(perfil);
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        return UsuarioResponseDTO.fromEntity(usuarioRepository.save(usuario));
    }

    public UsuarioResponseDTO atualizar(Integer id, UsuarioCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new UsuarioNaoEncontradoException(id));

        Empresa empresa = empresaRepository.findById(dto.empresaId())
                .orElseThrow(() -> new EmpresaNaoEncontradaException(dto.empresaId()));

        Perfil perfil = perfilRepository.findByIdAndEmpresaId(dto.perfilId(), empresa.getId())
                .orElseThrow(() -> new PerfilNaoEncontradoException(dto.perfilId()));

        if (usuarioRepository.existsByEmpresaIdAndEmailAndIdNot(empresa.getId(), dto.email(), id)) {
            throw new EmailJaCadastradoException(dto.email());
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