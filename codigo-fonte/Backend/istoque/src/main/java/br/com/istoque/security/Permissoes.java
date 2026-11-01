package br.com.istoque.security;

import java.util.Map;
import java.util.Set;

public final class Permissoes {

    public static final String USUARIOS_GERENCIAR = "usuarios.gerenciar";
    public static final String PERFIS_GERENCIAR = "perfis.gerenciar";
    public static final String EMPRESA_CONFIGURAR = "empresa.configurar";
    public static final String PRODUTOS_GERENCIAR = "produtos.gerenciar";
    public static final String ESTOQUE_MOVIMENTAR = "estoque.movimentar";
    public static final String ESTOQUE_AJUSTAR = "estoque.ajustar";
    public static final String RECEITAS_GERENCIAR = "receitas.gerenciar";
    public static final String PRODUCAO_REGISTRAR = "producao.registrar";
    public static final String RELATORIOS_VER = "relatorios.ver";

    public static final Map<String, Set<String>> MATRIZ_PADRAO = Map.of(
            "Administrador", Set.of(USUARIOS_GERENCIAR, PERFIS_GERENCIAR, EMPRESA_CONFIGURAR,
                    PRODUTOS_GERENCIAR, ESTOQUE_MOVIMENTAR, ESTOQUE_AJUSTAR, RECEITAS_GERENCIAR,
                    PRODUCAO_REGISTRAR, RELATORIOS_VER),
            "Gerente", Set.of(PRODUTOS_GERENCIAR, ESTOQUE_MOVIMENTAR, ESTOQUE_AJUSTAR,
                    RECEITAS_GERENCIAR, PRODUCAO_REGISTRAR, RELATORIOS_VER),
            "Funcionário", Set.of(ESTOQUE_MOVIMENTAR, PRODUCAO_REGISTRAR));

    private Permissoes() {
    }
}
