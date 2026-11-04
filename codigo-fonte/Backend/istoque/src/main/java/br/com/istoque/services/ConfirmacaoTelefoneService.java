package br.com.istoque.services;

import br.com.istoque.exception.CodigoInvalidoException;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.exception.LimiteDeCodigosException;
import br.com.istoque.exception.TelefoneNaoCadastradoException;
import br.com.istoque.exception.TelefoneNaoCelularException;
import br.com.istoque.infrastructure.entity.CodigoVerificacao;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.FinalidadeCodigo;
import br.com.istoque.infrastructure.repository.CodigoVerificacaoRepository;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.services.sms.EnviadorSms;
import br.com.istoque.util.TelefoneUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;

@Service
public class ConfirmacaoTelefoneService {

    private static final FinalidadeCodigo FINALIDADE = FinalidadeCodigo.CONFIRMACAO_TELEFONE;
    private static final Duration VALIDADE_DO_CODIGO = Duration.ofMinutes(10);
    private static final Duration INTERVALO_ENTRE_CODIGOS = Duration.ofSeconds(60);
    private static final Duration JANELA_DO_LIMITE = Duration.ofHours(1);
    private static final int CODIGOS_POR_JANELA = 5;
    private static final int TENTATIVAS_PERMITIDAS = 5;

    private final EmpresaRepository empresaRepository;
    private final CodigoVerificacaoRepository codigoRepository;
    private final EnviadorSms enviadorSms;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public ConfirmacaoTelefoneService(EmpresaRepository empresaRepository,
                                      CodigoVerificacaoRepository codigoRepository,
                                      EnviadorSms enviadorSms,
                                      PasswordEncoder passwordEncoder) {
        this.empresaRepository = empresaRepository;
        this.codigoRepository = codigoRepository;
        this.enviadorSms = enviadorSms;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public void enviarCodigo(Integer empresaId) {
        Empresa empresa = buscarEmpresa(empresaId);
        String telefone = empresa.getTelefone();
        if (telefone == null || telefone.isBlank()) {
            throw new TelefoneNaoCadastradoException();
        }
        if (!TelefoneUtils.ehCelular(telefone)) {
            throw new TelefoneNaoCelularException();
        }

        OffsetDateTime agora = OffsetDateTime.now();
        exigirLimites(empresaId, agora);

        String codigo = String.format("%06d", random.nextInt(1_000_000));
        enviadorSms.enviar(telefone, "Is.toque: seu código de confirmação é " + codigo + ". Vale por 10 minutos.");

        codigoRepository.invalidarAtivos(empresaId, FINALIDADE);
        codigoRepository.save(new CodigoVerificacao(
                empresaId, FINALIDADE, passwordEncoder.encode(codigo), agora, agora.plus(VALIDADE_DO_CODIGO)));
    }

    // noRollbackFor: é o que grava as tentativas erradas; sem ele o erro desfaz a contagem.
    @Transactional(noRollbackFor = CodigoInvalidoException.class)
    public void confirmar(Integer empresaId, String codigoInformado) {
        Empresa empresa = buscarEmpresa(empresaId);
        CodigoVerificacao codigo = codigoRepository
                .findFirstByEmpresaIdAndFinalidadeAndUsadoFalseOrderByEnviadoEmDesc(empresaId, FINALIDADE)
                .orElseThrow(CodigoInvalidoException::new);

        OffsetDateTime agora = OffsetDateTime.now();
        if (codigo.getExpiraEm().isBefore(agora)) {
            throw new CodigoInvalidoException();
        }

        if (codigoRepository.registrarTentativa(codigo.getId(), TENTATIVAS_PERMITIDAS) == 0) {
            throw new CodigoInvalidoException();
        }

        if (!passwordEncoder.matches(codigoInformado, codigo.getCodigoHash())) {
            codigoRepository.invalidarSeEsgotado(codigo.getId(), TENTATIVAS_PERMITIDAS);
            throw new CodigoInvalidoException();
        }

        if (codigoRepository.marcarComoUsado(codigo.getId()) == 0) {
            throw new CodigoInvalidoException();
        }
        empresa.setTelefoneVerificadoEm(agora);
        empresaRepository.save(empresa);
    }

    private void exigirLimites(Integer empresaId, OffsetDateTime agora) {
        boolean pediuHaPouco = codigoRepository
                .findFirstByEmpresaIdAndFinalidadeOrderByEnviadoEmDesc(empresaId, FINALIDADE)
                .map(ultimo -> ultimo.getEnviadoEm().isAfter(agora.minus(INTERVALO_ENTRE_CODIGOS)))
                .orElse(false);
        long naJanela = codigoRepository.countByEmpresaIdAndFinalidadeAndEnviadoEmAfter(
                empresaId, FINALIDADE, agora.minus(JANELA_DO_LIMITE));
        if (pediuHaPouco || naJanela >= CODIGOS_POR_JANELA) {
            throw new LimiteDeCodigosException();
        }
    }

    private Empresa buscarEmpresa(Integer empresaId) {
        return empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(empresaId));
    }
}
