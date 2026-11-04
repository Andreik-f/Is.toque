package br.com.istoque.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.com.istoque.dto.EmpresaRequestDTO;
import br.com.istoque.dto.EmpresaResponseDTO;
import br.com.istoque.exception.CnpjJaCadastradoException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.FinalidadeCodigo;
import br.com.istoque.infrastructure.repository.CodigoVerificacaoRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.util.CnpjUtils;
import br.com.istoque.util.TelefoneUtils;

import java.util.Objects;

@Service
@Transactional
public class EmpresaService {

    private final EmpresaRepository empresaRepository;
    private final PerfilService perfilService;
    private final CodigoVerificacaoRepository codigoRepository;

    public EmpresaService(EmpresaRepository empresaRepository, PerfilService perfilService,
                          CodigoVerificacaoRepository codigoRepository) {
        this.empresaRepository = empresaRepository;
        this.perfilService = perfilService;
        this.codigoRepository = codigoRepository;
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

    private Empresa buscarEntidadePorId(Integer id) {
        return empresaRepository.findById(id)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(id));
    }

    private void atualizarTelefone(Empresa empresa, String telefoneE164) {
        if (Objects.equals(empresa.getTelefone(), telefoneE164)) {
            return;
        }
        empresa.setTelefone(telefoneE164);
        empresa.setTelefoneVerificadoEm(null);
        if (empresa.getId() != null) {
            codigoRepository.invalidarAtivos(empresa.getId(), FinalidadeCodigo.CONFIRMACAO_TELEFONE);
        }
    }

    private void preencherEntidade(Empresa empresa, EmpresaRequestDTO dto) {
        empresa.setRazaoSocial(dto.razaoSocial());
        empresa.setNomeFantasia(dto.nomeFantasia());
        empresa.setCnpj(dto.cnpj());
        empresa.setEmail(dto.email());
        atualizarTelefone(empresa, TelefoneUtils.normalizar(dto.telefone()));
        // Campo vazio não apaga o valor: a coluna é obrigatória. Na criação a empresa ainda
        // não tem valor e o padrão é definido ao gravar (Empresa.aoCriar).
        if (dto.diasAlertaValidade() != null) {
            empresa.setDiasAlertaValidade(dto.diasAlertaValidade());
        }
    }

}
