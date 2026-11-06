package br.com.istoque.services;

import br.com.istoque.exception.ContaBloqueadaException;
import br.com.istoque.infrastructure.entity.Usuario;
import br.com.istoque.infrastructure.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;

// 5 senhas erradas seguidas, com no máximo 15 minutos entre uma e outra, bloqueiam
// a conta por 30 minutos; ao bloquear o contador volta a 0 e quem indica o bloqueio
// é bloqueadoAte; o contador também zera no primeiro acerto.
@Service
public class BloqueioDeLoginService {

    private static final int LIMITE_TENTATIVAS = 5;
    private static final Duration DURACAO_BLOQUEIO = Duration.ofMinutes(30);
    private static final Duration JANELA_DE_FALHAS = Duration.ofMinutes(15);

    private final UsuarioRepository usuarioRepository;

    public BloqueioDeLoginService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void exigirNaoBloqueado(Usuario usuario) {
        OffsetDateTime bloqueadoAte = usuario.getBloqueadoAte();
        if (bloqueadoAte != null && bloqueadoAte.isAfter(OffsetDateTime.now())) {
            throw new ContaBloqueadaException();
        }
    }

    // transação própria para gravar a tentativa mesmo quando a chamada lança exceção e faz rollback
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarFalha(Usuario usuario) {
        Usuario atual = usuarioRepository.buscarComTrava(usuario.getId()).orElseThrow();
        OffsetDateTime agora = OffsetDateTime.now();

        boolean janelaExpirou = atual.getUltimaFalhaEm() == null
                || atual.getUltimaFalhaEm().isBefore(agora.minus(JANELA_DE_FALHAS));
        int falhasAnteriores = atual.getTentativasFalhas() == null ? 0 : atual.getTentativasFalhas();
        int falhas = (janelaExpirou ? 0 : falhasAnteriores) + 1;

        if (falhas >= LIMITE_TENTATIVAS) {
            usuarioRepository.gravarFalhasDeSenha(atual.getId(), 0, agora.plus(DURACAO_BLOQUEIO), agora);
        } else {
            usuarioRepository.gravarFalhasDeSenha(atual.getId(), falhas, null, agora);
        }
    }

    public void registrarAcerto(Usuario usuario) {
        usuarioRepository.zerarFalhasDeSenha(usuario.getId());
    }
}
