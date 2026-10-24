package br.com.istoque.services;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.exception.CnpjJaCadastradoException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.util.CnpjUtils;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final PerfilService perfilService;

    public EmpresaService(EmpresaRepository empresaRepository, PerfilService perfilService) {
        this.empresaRepository = empresaRepository;
        this.perfilService = perfilService;
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
        String cnpj = CnpjUtils.formatar(dto.cnpj());
        if (empresaRepository.existsByCnpj(cnpj)) {
            throw new CnpjJaCadastradoException(cnpj);
        }

        Empresa empresa = new Empresa();
        preencherEntidade(empresa, dto);

        Empresa empresaSalva = empresaRepository.save(empresa);
        perfilService.criarPerfisPadrao(empresaSalva);
        return EmpresaResponseDTO.fromEntity(empresaSalva);

    }

    public EmpresaResponseDTO atualizar(Integer id, EmpresaRequestDTO dto) {
        Empresa empresa = buscarEntidadePorId(id);

        String cnpjFormatado = CnpjUtils.formatar(dto.cnpj());

        empresaRepository.findByCnpj(cnpjFormatado)
                .filter(outraEmpresa -> !outraEmpresa.getId().equals(id))
                .ifPresent(outraEmpresa -> {
                    throw new CnpjJaCadastradoException(cnpjFormatado);
                });

        preencherEntidade(empresa, dto);

        // saveAndFlush força a execução do UPDATE (e do @PreUpdate) agora, e não
        // apenas no fim da transação, para que atualizadoEm já venha correto na
        // resposta.
        Empresa empresaAtualizada = empresaRepository.saveAndFlush(empresa);
        return EmpresaResponseDTO.fromEntity(empresaAtualizada);
    }

    public void deletar(Integer id) {
        Empresa empresa = buscarEntidadePorId(id);
        // Os perfis padrão são criados junto com a empresa, então saem junto com ela.
        // Se a empresa tiver usuários, produtos ou outros dados, o banco recusa a
        // exclusão, a API devolve 409 e a transação desfaz tudo, inclusive a
        // exclusão dos perfis.
        perfilService.excluirPerfisDaEmpresa(empresa);
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
        if (dto.diasAlertaValidade() != null) {
            empresa.setDiasAlertaValidade(dto.diasAlertaValidade());
        }
    }

}
