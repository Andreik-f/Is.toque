package br.com.istoque.services;

import br.com.istoque.dto.ItemReceitaRequestDTO;
import br.com.istoque.dto.ItemReceitaResponseDTO;
import br.com.istoque.dto.ReceitaRequestDTO;
import br.com.istoque.dto.ReceitaResponseDTO;
import br.com.istoque.exception.EmpresaNaoEncontradaException;
import br.com.istoque.exception.ProdutoNaoEncontradoException;
import br.com.istoque.exception.ProdutoRepetidoNaReceitaException;
import br.com.istoque.exception.ReceitaJaCadastradaException;
import br.com.istoque.exception.ReceitaNaoEncontradaException;
import br.com.istoque.infrastructure.entity.Empresa;
import br.com.istoque.infrastructure.entity.ItemReceita;
import br.com.istoque.infrastructure.entity.Produto;
import br.com.istoque.infrastructure.entity.Receita;
import br.com.istoque.infrastructure.repository.EmpresaRepository;
import br.com.istoque.infrastructure.repository.ProdutoRepository;
import br.com.istoque.infrastructure.repository.ReceitaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Ficha técnica das receitas (RF-20 e RF-21). Todas as operações valem só para
 * a empresa informada: receita de outra empresa responde como inexistente.
 * Cadastrar ou editar a ficha não mexe no saldo nem nos lotes dos produtos.
 */
@Service
public class ReceitaService {

    private final ReceitaRepository receitaRepository;
    private final ProdutoRepository produtoRepository;
    private final EmpresaRepository empresaRepository;

    public ReceitaService(ReceitaRepository receitaRepository,
                          ProdutoRepository produtoRepository,
                          EmpresaRepository empresaRepository) {
        this.receitaRepository = receitaRepository;
        this.produtoRepository = produtoRepository;
        this.empresaRepository = empresaRepository;
    }

    @Transactional(readOnly = true)
    public List<ReceitaResponseDTO> listar(Integer empresaId) {
        return receitaRepository.findAllByEmpresaIdOrderByNome(empresaId).stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReceitaResponseDTO buscarPorId(Integer id, Integer empresaId) {
        return toResponseDTO(buscarDaEmpresa(id, empresaId));
    }

    /**
     * @throws ReceitaJaCadastradaException se já existe receita ativa com o mesmo nome na empresa
     * @throws ProdutoRepetidoNaReceitaException se um produto aparece mais de uma vez nos itens
     * @throws ProdutoNaoEncontradoException se um produto não existe, está inativo ou é de outra empresa
     */
    @Transactional
    public ReceitaResponseDTO cadastrar(ReceitaRequestDTO dto, Integer empresaId) {
        String nome = dto.nome().trim();
        validarNomeUnico(nome, empresaId);

        Empresa empresa = empresaRepository.findById(empresaId)
                .orElseThrow(() -> new EmpresaNaoEncontradaException(empresaId));

        Receita receita = new Receita();
        receita.setEmpresa(empresa);
        preencherDados(receita, nome, dto);
        sincronizarItens(receita, dto.itens(), empresaId);

        return toResponseDTO(receitaRepository.save(receita));
    }

    /**
     * Substitui os dados e a lista de itens. Os itens são comparados por
     * produto: quem continua só muda a quantidade, quem saiu é removido e quem
     * entrou é criado. Receita desativada não pode ser editada.
     */
    @Transactional
    public ReceitaResponseDTO atualizar(Integer id, ReceitaRequestDTO dto, Integer empresaId) {
        Receita receita = buscarAtivaDaEmpresa(id, empresaId);

        String nome = dto.nome().trim();
        if (!receita.getNome().equalsIgnoreCase(nome)) {
            validarNomeUnico(nome, empresaId);
        }

        preencherDados(receita, nome, dto);
        sincronizarItens(receita, dto.itens(), empresaId);

        return toResponseDTO(receitaRepository.save(receita));
    }

    @Transactional
    public void desativar(Integer id, Integer empresaId) {
        Receita receita = buscarAtivaDaEmpresa(id, empresaId);
        receita.setAtivo(false);
        receitaRepository.save(receita);
    }

    private Receita buscarDaEmpresa(Integer id, Integer empresaId) {
        return receitaRepository.findByIdAndEmpresaId(id, empresaId)
                .orElseThrow(() -> new ReceitaNaoEncontradaException(id));
    }

    private Receita buscarAtivaDaEmpresa(Integer id, Integer empresaId) {
        Receita receita = buscarDaEmpresa(id, empresaId);
        if (!Boolean.TRUE.equals(receita.getAtivo())) {
            throw new ReceitaNaoEncontradaException(id);
        }
        return receita;
    }

    private void validarNomeUnico(String nome, Integer empresaId) {
        if (receitaRepository.existsByNomeIgnoreCaseAndEmpresaIdAndAtivoTrue(nome, empresaId)) {
            throw new ReceitaJaCadastradaException(nome);
        }
    }

    private void preencherDados(Receita receita, String nome, ReceitaRequestDTO dto) {
        receita.setNome(nome);
        receita.setDescricao(dto.descricao());
        receita.setCategoria(dto.categoria().trim());
        receita.setRendimento(dto.rendimento().trim());
        receita.setTempoPreparoMinutos(dto.tempoPreparoMinutos());
    }

    private void sincronizarItens(Receita receita, List<ItemReceitaRequestDTO> itensDto, Integer empresaId) {
        Set<Integer> idsNovos = new HashSet<>();
        for (ItemReceitaRequestDTO itemDto : itensDto) {
            if (!idsNovos.add(itemDto.produtoId())) {
                throw new ProdutoRepetidoNaReceitaException(itemDto.produtoId());
            }
        }

        // Só entram produtos ativos da própria empresa; os outros respondem como inexistentes
        Map<Integer, Produto> produtos = produtoRepository.findAllById(idsNovos).stream()
                .filter(p -> p.getEmpresa().getId().equals(empresaId))
                .filter(p -> Boolean.TRUE.equals(p.getAtivo()))
                .collect(Collectors.toMap(Produto::getId, Function.identity()));

        Map<Integer, ItemReceita> existentes = receita.getItens().stream()
                .collect(Collectors.toMap(i -> i.getProduto().getId(), Function.identity()));

        receita.getItens().removeIf(i -> !idsNovos.contains(i.getProduto().getId()));

        for (ItemReceitaRequestDTO itemDto : itensDto) {
            Produto produto = produtos.get(itemDto.produtoId());
            if (produto == null) {
                throw new ProdutoNaoEncontradoException(itemDto.produtoId());
            }
            ItemReceita item = existentes.get(itemDto.produtoId());
            if (item == null) {
                item = new ItemReceita();
                item.setProduto(produto);
                receita.adicionarItem(item);
            }
            item.setQuantidade(itemDto.quantidade());
        }
    }

    private ReceitaResponseDTO toResponseDTO(Receita receita) {
        List<ItemReceitaResponseDTO> itens = receita.getItens().stream()
                .map(item -> new ItemReceitaResponseDTO(
                        item.getProduto().getId(),
                        item.getProduto().getNome(),
                        item.getQuantidade()))
                .toList();

        return new ReceitaResponseDTO(
                receita.getId(),
                receita.getNome(),
                receita.getDescricao(),
                receita.getCategoria(),
                receita.getRendimento(),
                receita.getTempoPreparoMinutos(),
                receita.getAtivo(),
                receita.getCriadoEm(),
                receita.getAtualizadoEm(),
                itens
        );
    }
}
