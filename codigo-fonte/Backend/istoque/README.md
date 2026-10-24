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

## Endpoints

A API ainda não exige autenticação: o login confere e-mail e senha, mas não gera token, e o `SecurityConfig` libera todas as rotas (HT001). Por isso a coluna "Exige autenticação" é "Não" em todas. Como o isolamento entre empresas no servidor também ainda não existe (HT002), as rotas recebem o `empresaId` por parâmetro ou no corpo.

| Método | Caminho | O que faz | Exige autenticação |
|---|---|---|---|
| POST | `/api/auth/login` | Entra com e-mail e senha; devolve os dados do usuário e da empresa | Não |
| POST | `/api/auth/cadastro` | Cria a empresa, os perfis padrão e o administrador | Não |
| GET | `/api/empresas` | Lista as empresas | Não |
| GET | `/api/empresas/{id}` | Busca uma empresa | Não |
| POST | `/api/empresas` | Cadastra uma empresa (com os perfis padrão) | Não |
| PUT | `/api/empresas/{id}` | Atualiza uma empresa | Não |
| DELETE | `/api/empresas/{id}` | Exclui a empresa (exclusão definitiva) | Não |
| GET | `/api/usuarios` | Lista os usuários | Não |
| POST | `/api/usuarios` | Cadastra um usuário | Não |
| PUT | `/api/usuarios/{id}` | Atualiza nome, e-mail, perfil e empresa do usuário | Não |
| PATCH | `/api/usuarios/{id}/senha` | Altera a senha do usuário (`novaSenha`) | Não |
| DELETE | `/api/usuarios/{id}` | Desativa o usuário (exclusão lógica) | Não |
| GET | `/api/perfis?empresaId=` | Lista os perfis da empresa | Não |
| GET | `/api/categorias?empresaId=` | Lista as categorias da empresa | Não |
| POST | `/api/categorias` | Cadastra uma categoria | Não |
| GET | `/api/unidades-medida` | Lista as unidades de medida | Não |
| GET | `/api/produtos?empresaId=` | Lista os produtos (`empresaId` é opcional e filtra) | Não |
| GET | `/api/produtos/ativos?empresaId=` | Lista só os produtos ativos | Não |
| GET | `/api/produtos/{id}` | Busca um produto | Não |
| POST | `/api/produtos` | Cadastra um produto | Não |
| PUT | `/api/produtos/{id}` | Atualiza um produto (a quantidade atual enviada é ignorada) | Não |
| PATCH | `/api/produtos/{id}/desativar` | Desativa o produto (exclusão lógica) | Não |
| GET | `/actuator/health` | Situação da API e da conexão com o banco | Não |

Os erros seguem o formato `{ timestamp, status, message, campos }`. Os corpos de requisição e resposta, as regras de validação, as mensagens de erro e os exemplos de cada rota estão na [Wiki do projeto](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/wiki). A API publicada está em https://is-toque-prod.onrender.com. Ainda não existem rotas para movimentações, receitas, produção e fotos: as tabelas de estoque e receitas já existem no banco, mas sem endpoints.

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
