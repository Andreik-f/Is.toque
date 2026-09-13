package com.istoque.backend.service;

import com.istoque.backend.dto.EmpresaRequestDTO;
import com.istoque.backend.dto.EmpresaResponseDTO;
import com.istoque.backend.exception.CnpjJaCadastradoException;
import com.istoque.backend.exception.EmpresaNaoEncontradaException;
import com.istoque.backend.model.Empresa;
import com.istoque.backend.repository.EmpresaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository empresaRepository;

    public EmpresaService(EmpresaRepository empresaRepository) {
        this.empresaRepository = empresaRepository;
    }

    @Transactional(readOnly = true)
    public List<EmpresaResponseDTO> listarTodas() {
        return empresaRepository.findAll()
                .stream()
                .map(EmpresaResponseDTO::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmpresaResponseDTO buscarPorId(Integer id) {
        Empresa empresa = buscarEntidadePorId(id);
        return EmpresaResponseDTO.fromEntity(empresa);
    }

    public EmpresaResponseDTO criar(EmpresaRequestDTO dto) {
        if (empresaRepository.existsByCnpj(dto.cnpj())) {
            throw new CnpjJaCadastradoException(dto.cnpj());
        }

        Empresa empresa = new Empresa();
        preencherEntidade(empresa, dto);

        Empresa empresaSalva = empresaRepository.save(empresa);
        return EmpresaResponseDTO.fromEntity(empresaSalva);
    }

    public EmpresaResponseDTO atualizar(Integer id, EmpresaRequestDTO dto) {
        Empresa empresa = buscarEntidadePorId(id);

        empresaRepository.findByCnpj(dto.cnpj())
                .filter(outraEmpresa -> !outraEmpresa.getId().equals(id))
                .ifPresent(outraEmpresa -> {
                    throw new CnpjJaCadastradoException(dto.cnpj());
                });

        preencherEntidade(empresa, dto);

        // saveAndFlush força a execução do UPDATE (e do @PreUpdate) agora, e não
        // apenas no fim da transação, para que atualizadoEm já venha correto na resposta.
        Empresa empresaAtualizada = empresaRepository.saveAndFlush(empresa);
        return EmpresaResponseDTO.fromEntity(empresaAtualizada);
    }

    public void deletar(Integer id) {
        Empresa empresa = buscarEntidadePorId(id);
        empresaRepository.delete(empresa);
    }

    private Empresa buscarEntidadePorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(id));
    }

    private void preencherEntidade(Empresa empresa, EmpresaRequestDTO dto) {
        empresa.setRazaoSocial(dto.razaoSocial());
        empresa.setNomeFantasia(dto.nomeFantasia());
        empresa.setCnpj(dto.cnpj());
        empresa.setEmail(dto.email());
        empresa.setTelefone(dto.telefone());
        empresa.setDiasAlertaValidade(dto.diasAlertaValidade());
    }

}
