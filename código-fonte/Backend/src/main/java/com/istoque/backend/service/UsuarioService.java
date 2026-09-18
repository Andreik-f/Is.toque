package com.istoque.backend.service;

import com.istoque.backend.dto.UsuarioCreateDTO;
import com.istoque.backend.model.Empresa;
import com.istoque.backend.model.Usuario;
import com.istoque.backend.repository.EmpresaRepository;
import com.istoque.backend.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EmpresaRepository empresaRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, EmpresaRepository empresaRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.empresaRepository = empresaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // CREATE
    public Usuario criarUsuario(UsuarioCreateDTO dto) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setPerfilId(dto.perfilId());
        
        Empresa empresa = empresaRepository.findById(dto.empresaId())
            .orElseThrow(() -> new RuntimeException("Empresa não encontrada"));
        usuario.setEmpresa(empresa);
        
        // CRIPTOGRAFANDO A SENHA COM BCRYPT!
        usuario.setSenha(passwordEncoder.encode(dto.senha()));

        return usuarioRepository.save(usuario);
    }

    // READ
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }
// UPDATE: Atualizar dados normais do usuário
    public Usuario atualizarUsuario(Integer id, UsuarioCreateDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setPerfilId(dto.perfilId());

        return usuarioRepository.save(usuario);
    }

    // UPDATE: Trocar apenas a senha
    public void alterarSenha(Integer id, String novaSenha) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
            
        usuario.setSenha(passwordEncoder.encode(novaSenha)); // Salva o novo hash!
        usuarioRepository.save(usuario);
    }
    // DELETE (Soft Delete: apenas inativa o usuário)
    public void inativarUsuario(Integer id) {
        usuarioRepository.findById(id).ifPresent(usuario -> {
            usuario.setAtivo(false);
            usuarioRepository.save(usuario);
        });
    }
}