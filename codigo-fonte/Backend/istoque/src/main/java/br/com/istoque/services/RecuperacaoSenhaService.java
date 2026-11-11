package br.com.istoque.services;

import br.com.istoque.exception.CodigoInvalidoException;
import br.com.istoque.exception.FalhaNoEnvioDeSmsException;
import br.com.istoque.infrastructure.entity.CodigoVerificacao;
import br.com.istoque.infrastructure.entity.FinalidadeCodigo;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.CodigoVerificacaoRepository;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import br.com.istoque.services.sms.EnviadorSms;
import br.com.istoque.util.EmailUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class RecuperacaoSenhaService {

    private static final Logger log = LoggerFactory.getLogger(RecuperacaoSenhaService.class);
    private static final FinalidadeCodigo FINALIDADE = FinalidadeCodigo.RECUPERACAO_SENHA;
    private static final Duration VALIDADE_DO_CODIGO = Duration.ofMinutes(10);
    private static final Duration INTERVALO_ENTRE_CODIGOS = Duration.ofSeconds(60);
    private static final Duration JANELA_DO_LIMITE = Duration.ofHours(1);
    private static final int CODIGOS_POR_USUARIO = 5;
    private static final int CODIGOS_POR_EMPRESA = 10;
    private static final int TENTATIVAS_PERMITIDAS = 5;

    private final UsuarioRepository usuarioRepository;
    private final CodigoVerificacaoRepository codigoRepository;
    private final BloqueioDeLoginService bloqueioDeLoginService;
    private final EnviadorSms enviadorSms;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom random = new SecureRandom();

    public RecuperacaoSenhaService(UsuarioRepository usuarioRepository,
                                   CodigoVerificacaoRepository codigoRepository,
                                   BloqueioDeLoginService bloqueioDeLoginService,
                                   EnviadorSms enviadorSms,
                                   PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.codigoRepository = codigoRepository;
        this.bloqueioDeLoginService = bloqueioDeLoginService;
        this.enviadorSms = enviadorSms;
        this.passwordEncoder = passwordEncoder;
    }

    // Sem usuário apto, acima do limite ou com falha no SMS, não envia e não avisa: uma resposta
    // diferente da de um e-mail desconhecido revelaria quais contas existem.
    @Transactional
    public void enviarCodigo(String email) {
        Usuario usuario = buscarApto(email).orElse(null);
        if (usuario == null) {
            return;
        }
        Integer empresaId = usuario.getEmpresa().getId();
        OffsetDateTime agora = OffsetDateTime.now();
        OffsetDateTime inicioDaJanela = agora.minus(JANELA_DO_LIMITE);
        boolean pediuHaPouco = codigoRepository.findFirstByUsuarioIdOrderByEnviadoEmDesc(usuario.getId())
                .filter(ultimo -> ultimo.getEnviadoEm().isAfter(agora.minus(INTERVALO_ENTRE_CODIGOS)))
                .isPresent();
        if (pediuHaPouco
                || codigoRepository.countByUsuarioIdAndEnviadoEmAfter(usuario.getId(), inicioDaJanela)
                        >= CODIGOS_POR_USUARIO
                || codigoRepository.countByEmpresaIdAndFinalidadeAndEnviadoEmAfter(empresaId, FINALIDADE, inicioDaJanela)
                        >= CODIGOS_POR_EMPRESA) {
            log.info("Pedido de código de recuperação acima do limite: usuário {}", usuario.getId());
            return;
        }

        String codigo = String.format("%06d", random.nextInt(1_000_000));
        try {
            enviadorSms.enviar(usuario.getEmpresa().getTelefone(), "Is.toque: código " + codigo + " para "
                    + usuario.getNome() + " (" + usuario.getEmail() + ") criar uma nova senha. Vale por 10 minutos.");
        } catch (FalhaNoEnvioDeSmsException e) {
            // sem código gravado, o próximo pedido não esbarra no intervalo de 60 segundos
            log.warn("Código de recuperação não enviado: falha no SMS para o usuário {}", usuario.getId());
            return;
        }

        CodigoVerificacao novo = new CodigoVerificacao(
                empresaId, FINALIDADE, passwordEncoder.encode(codigo), agora, agora.plus(VALIDADE_DO_CODIGO));
        novo.setUsuarioId(usuario.getId());
        codigoRepository.save(novo);
    }

    // noRollbackFor: é o que grava as tentativas erradas; sem ele o erro desfaz a contagem.
    @Transactional(noRollbackFor = CodigoInvalidoException.class)
    public void confirmar(String email, String codigoInformado, String novaSenha) {
        Usuario usuario = buscarApto(email).orElseThrow(CodigoInvalidoException::new);
        // só o código mais recente vale: um novo pedido aposenta os anteriores
        CodigoVerificacao codigo = codigoRepository.findFirstByUsuarioIdOrderByEnviadoEmDesc(usuario.getId())
                .filter(ultimo -> ultimo.getExpiraEm().isAfter(OffsetDateTime.now()))
                .orElseThrow(CodigoInvalidoException::new);

        if (codigoRepository.registrarTentativa(codigo.getId(), TENTATIVAS_PERMITIDAS) == 0) {
            throw new CodigoInvalidoException();
        }
        if (!passwordEncoder.matches(codigoInformado, codigo.getCodigoHash())) {
            codigoRepository.invalidarSeEsgotado(codigo.getId(), TENTATIVAS_PERMITIDAS);
            bloqueioDeLoginService.registrarFalha(usuario);
            throw new CodigoInvalidoException();
        }
        if (codigoRepository.marcarComoUsado(codigo.getId()) == 0) {
            throw new CodigoInvalidoException();
        }

        // quem provou o código volta a entrar: a troca também desfaz o bloqueio de login
        usuario.setTentativasFalhas(0);
        usuario.setBloqueadoAte(null);
        usuario.setUltimaFalhaEm(null);
        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuario.setTokenVersao(usuario.getTokenVersao() + 1);
        usuarioRepository.save(usuario);
    }

    // apto: usuário ativo de uma empresa com telefone confirmado
    private Optional<Usuario> buscarApto(String email) {
        return usuarioRepository.findByEmail(EmailUtils.normalizar(email))
                .filter(usuario -> Boolean.TRUE.equals(usuario.getAtivo())
                        && usuario.getEmpresa().getTelefoneVerificadoEm() != null);
    }
}
