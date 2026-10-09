# Backend do Is.toque

API em Spring Boot 4 (Java 21) com banco PostgreSQL.

## Como rodar

Precisa do JDK 21. O Maven vem junto no projeto (`mvnw`).

```powershell
cd codigo-fonte\Backend\istoque
.\mvnw.cmd spring-boot:run   # API em http://localhost:8080
.\mvnw.cmd test              # testes (banco H2 em memória, não toca no Neon)
```

Para conferir se a API conectou no banco: http://localhost:8080/actuator/health

## Banco de dados e migrações (Flyway)

O banco só muda por **migrações**: scripts SQL versionados em `src/main/resources/db/migration`. O Hibernate não cria nem altera tabelas (`spring.jpa.hibernate.ddl-auto=validate`); ele só confere se as entidades batem com o banco. Se não baterem, a aplicação não sobe e mostra qual tabela ou coluna está diferente.

Ao subir, a aplicação roda o Flyway antes de tudo. Ele lê a tabela `flyway_schema_history`, que guarda as migrações já aplicadas naquele banco, e roda só as que faltam, em ordem.

- `V1__estado_inicial.sql` é o banco como ele estava quando o Flyway entrou no projeto. Os bancos que já existiam foram marcados como estando na V1 (baseline) e não rodam esse script. Num banco vazio, ele roda e cria tudo.
- Os modelos do banco (conceitual, lógico e EER) estão em [Arquitetura da Solução](../../../documentação/08-Arquitetura%20da%20Solução.md).

### Como criar uma migração nova

1. Crie um arquivo na pasta `src/main/resources/db/migration` com o próximo número de versão e uma descrição curta, separados por **dois** sublinhados:

   ```
   V2__cria_tabela_permissao.sql
   ```

2. Escreva nele o SQL da mudança (`CREATE TABLE`, `ALTER TABLE`, `INSERT` de dados fixos etc.). Cada migração roda numa transação: se der erro, nada dela fica gravado.
3. No mesmo PR, ajuste as entidades Java para baterem com o banco novo.
4. Rode `.\mvnw.cmd spring-boot:run`. O Flyway aplica a migração e o Hibernate valida as entidades.

### Regras

- **Nunca altere uma migração que já foi aplicada** em algum banco (o banco compartilhado conta). O Flyway guarda uma soma de verificação de cada script e, se o arquivo mudar, a aplicação não sobe. Para corrigir algo, crie uma migração nova.
- Não mude o banco à mão nem volte o `ddl-auto` para `update`: a mudança não fica registrada e os outros bancos ficam diferentes.
- Se duas branches criarem a mesma versão (duas `V2`, por exemplo), quem fizer o merge por último renomeia a sua para o próximo número antes de juntar.
- Os testes usam H2, que não aceita os tipos enum do PostgreSQL. Por isso eles não rodam as migrações (`spring.flyway.enabled=false` em `src/test/resources/application.properties`); o Hibernate cria as tabelas a partir das entidades.

### Bancos

| Banco | Situação |
|---|---|
| Desenvolvimento (Neon, compartilhado) | Baseline na V1 feito em 09/10/2026. |
| Produção (Neon `is-toque-prod`, repositório `is.toque_prod`) | Esquema igualado ao da V1 em 09/10/2026, com os dados que já existiam, e baseline na V1 feito no mesmo dia. A API publicada ainda roda o código antigo, sem Flyway; quando receber o código atual, o Flyway encontra a V1 marcada e não roda nada. |
