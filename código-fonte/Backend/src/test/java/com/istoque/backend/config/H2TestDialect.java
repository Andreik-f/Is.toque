package com.istoque.backend.config;

import org.hibernate.boot.model.TypeContributions;
import org.hibernate.dialect.H2Dialect;
import org.hibernate.service.ServiceRegistry;
import org.hibernate.type.SqlTypes;
import org.hibernate.type.descriptor.jdbc.VarcharJdbcType;

/**
 * Dialeto usado SOMENTE nos testes (H2).
 *
 * No banco real, produto.tipo é um enum nativo do PostgreSQL (tipo_produto),
 * por isso a entidade usa @JdbcTypeCode(SqlTypes.NAMED_ENUM). O H2Dialect não
 * conhece esse tipo: sem este ajuste o Hibernate não gera o DDL da tabela
 * produto (derrubando o contexto de todos os testes) e, mesmo com o DDL, tenta
 * gravar o enum como binário. Aqui o NAMED_ENUM é tratado como varchar, tanto
 * na criação da coluna quanto na leitura/gravação.
 */
public class H2TestDialect extends H2Dialect {

    @Override
    public void contributeTypes(TypeContributions typeContributions, ServiceRegistry serviceRegistry) {
        super.contributeTypes(typeContributions, serviceRegistry);
        typeContributions.getTypeConfiguration().getJdbcTypeRegistry()
                .addDescriptor(SqlTypes.NAMED_ENUM, VarcharJdbcType.INSTANCE);
    }
}
