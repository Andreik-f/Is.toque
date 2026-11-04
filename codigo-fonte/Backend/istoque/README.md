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

O login e o cadastro devolvem um `token` e o `expiraEm` (validade definida em `jwt.expiration-ms`; hoje, 8 horas). As demais rotas, exceto `/actuator/health`, exigem esse token em `Authorization: Bearer <token>` e respondem `401` sem ele ou com ele vencido. A empresa vem sempre do token (HT002): as rotas não recebem `empresaId`, e o valor que o cliente ainda enviar na URL ou no corpo é ignorado. Recurso de outra empresa responde `404`, com a mesma mensagem de registro inexistente.

| Método | Caminho | O que faz | Exige autenticação |
|---|---|---|---|
| POST | `/api/auth/login` | Entra com e-mail e senha; devolve os dados do usuário e da empresa | Não |
| POST | `/api/auth/cadastro` | Cria a empresa, os perfis padrão e o administrador; aceita `telefone` da empresa (opcional, gravado em E.164, nunca envia SMS) | Não |
| GET | `/api/empresas/minha` | Busca a empresa do usuário logado | Sim |
| PUT | `/api/empresas/minha` | Atualiza a empresa do usuário logado; valida o `telefone` e grava em E.164 (exige `empresa.configurar`) | Sim |
| POST | `/api/empresas/minha/telefone/codigo` | Envia por SMS o código de 6 dígitos para confirmar o telefone da empresa; `429` se pedir antes de 60 segundos ou mais de 5 vezes por hora (exige `empresa.configurar`) | Sim |
| POST | `/api/empresas/minha/telefone/confirmar` | Confirma o telefone com `{ "codigo" }`; `400` se errado, vencido ou usado (exige `empresa.configurar`) | Sim |
| GET | `/api/usuarios` | Lista os usuários da empresa (exige `usuarios.gerenciar`) | Sim |
| POST | `/api/usuarios` | Cadastra um usuário na empresa (exige `usuarios.gerenciar`) | Sim |
| PUT | `/api/usuarios/{id}` | Atualiza nome, e-mail e perfil do usuário (exige `usuarios.gerenciar`) | Sim |
| PATCH | `/api/usuarios/{id}/senha` | Altera a senha do usuário (`novaSenha`) (exige `usuarios.gerenciar`) | Sim |
| DELETE | `/api/usuarios/{id}` | Desativa o usuário (exclusão lógica) (exige `usuarios.gerenciar`) | Sim |
| GET | `/api/permissoes` | Lista os nove códigos de permissão, com descrição e módulo | Sim |
| GET | `/api/perfis` | Lista os perfis da empresa, com as permissões de cada um | Sim |
| POST | `/api/perfis` | Cria um perfil com nome, descrição e permissões (exige `perfis.gerenciar`) | Sim |
| PUT | `/api/perfis/{id}` | Altera nome, descrição e permissões do perfil (exige `perfis.gerenciar`) | Sim |
| DELETE | `/api/perfis/{id}` | Exclui um perfil sem usuários (exige `perfis.gerenciar`) | Sim |
| GET | `/api/categorias` | Lista as categorias da empresa | Sim |
| POST | `/api/categorias` | Cadastra uma categoria (exige `produtos.gerenciar`) | Sim |
| GET | `/api/unidades-medida` | Lista as unidades de medida | Sim |
| GET | `/api/produtos` | Lista os produtos da empresa | Sim |
| GET | `/api/produtos/ativos` | Lista só os produtos ativos | Sim |
| GET | `/api/produtos/{id}` | Busca um produto | Sim |
| POST | `/api/produtos` | Cadastra um produto (exige `produtos.gerenciar`) | Sim |
| PUT | `/api/produtos/{id}` | Atualiza um produto (a quantidade atual enviada é ignorada; exige `produtos.gerenciar`) | Sim |
| PATCH | `/api/produtos/{id}/desativar` | Desativa o produto (exclusão lógica; exige `produtos.gerenciar`) | Sim |
| GET | `/api/receitas` | Lista as receitas da empresa do usuário logado | Sim |
| GET | `/api/receitas/{id}` | Busca uma receita com seus itens | Sim |
| POST | `/api/receitas` | Cadastra uma receita (ficha técnica): `404` se um produto não existe, está inativo ou é de outra empresa, `400` se repetir produto, `409` se já houver receita ativa com o nome; exige `receitas.gerenciar` | Sim |
| PUT | `/api/receitas/{id}` | Atualiza os dados e a lista de itens (receita desativada responde `404`; exige `receitas.gerenciar`) | Sim |
| PATCH | `/api/receitas/{id}/desativar` | Desativa a receita (exclusão lógica), responde `204`; exige `receitas.gerenciar` | Sim |
| GET | `/actuator/health` | Situação da API e da conexão com o banco | Não |

### Permissões e bloqueios

Cada rota exige uma permissão do perfil do usuário, definida num lugar só, o `SecurityConfig` (a tabela completa e a matriz padrão dos três perfis estão em [Perfis](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/wiki/Perfis)). Qualquer consulta (`GET`) vale para qualquer usuário logado, exceto `/api/usuarios`, que exige `usuarios.gerenciar`. As permissões são: `usuarios.gerenciar`, `perfis.gerenciar`, `empresa.configurar`, `produtos.gerenciar`, `estoque.movimentar`, `estoque.ajustar`, `receitas.gerenciar`, `producao.registrar` e `relatorios.ver`. Sem a permissão, a resposta é `403` com `Seu perfil não permite esta ação.`; o login devolve a lista de permissões do usuário.

Ninguém concede nem altera o que não tem: quem cria ou edita um perfil só inclui permissões que tem, e não altera nem exclui um perfil com permissões que não tem. Quem gerencia usuários só atribui um perfil cujas permissões tem todas, e só altera, troca a senha ou inativa quem hoje tem um perfil assim. Descumprir a regra responde `403`.

Estas operações respondem `409`:

- inativar o próprio usuário;
- inativar o último administrador ativo;
- tirar o perfil de Administrador do último administrador ativo;
- criar ou renomear um perfil para um nome que já existe na empresa (sem diferenciar maiúsculas);
- excluir um perfil que tem usuários, ativos ou inativos.

O perfil Administrador não pode ser renomeado nem perder `usuarios.gerenciar` ou `perfis.gerenciar`: a resposta é `422`.

Os erros seguem o formato `{ timestamp, status, message, campos }`. Os corpos de requisição e resposta, as regras de validação, as mensagens de erro e os exemplos de cada rota estão na [Wiki do projeto](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/wiki). A API publicada está em https://is-toque-prod.onrender.com. As rotas de receitas usam a empresa do usuário logado e não recebem `empresaId`. Ainda não existem rotas para movimentações, produção e fotos: as tabelas de estoque e receitas já existem no banco, mas sem endpoints.

### Envio de SMS (HU021)

O código de confirmação do telefone é enviado por uma implementação de `EnviadorSms`, escolhida pela variável `SMS_PROVEDOR`:

| Variável | Para que serve |
|---|---|
| `SMS_PROVEDOR` | `textbee` envia de verdade; `log` só registra a mensagem no log. Em desenvolvimento o padrão é `log`; em produção não há padrão: sem ela a API sobe e o envio do código responde `503`, e `log` não funciona |
| `TEXTBEE_API_KEY` | Chave da API do TextBee (obrigatória com `SMS_PROVEDOR=textbee`) |
| `TEXTBEE_DEVICE_ID` | Aparelho que envia os SMS (obrigatória com `SMS_PROVEDOR=textbee`) |

Os valores nunca vão para o repositório. Os testes usam `log` e simulam o envio: nenhum SMS de verdade sai.

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

### Notas para os próximos cards de estoque (HT035)

O `ddl-auto=validate` não confere nulabilidade, CHECKs nem índices, e o CI não roda o SQL das migrações (os testes usam H2 com o Flyway desligado). Ao criar as entidades das tabelas novas, vale lembrar:

- **`produto_foto`**
  - Mapear `conteudo` como `byte[]` **sem `@Lob`**: no Hibernate 7 com PostgreSQL, `@Lob` mapeia para `oid` (o `byte[]` simples vira `bytea`), e o `validate` reprova a coluna `bytea`.
  - Gravar `tamanho_bytes` igual ao tamanho real do conteúdo: o banco recusa se forem diferentes (`ck_foto_tamanho_confere`). Validar o tipo (`image/jpeg`, `image/png` ou `image/webp`) e o limite de 5 MB no back-end antes de gravar, para devolver uma mensagem clara em vez do 409 genérico.
  - Ao devolver a foto, usar o `tipo_arquivo` gravado como `Content-Type` e enviar `X-Content-Type-Options: nosniff`. O CHECK só vê o texto do tipo, não os bytes da imagem.
- **`receita`**
  - `categoria` e `rendimento` são `varchar(60)`: validar `@Size(max = 60)` no DTO, senão o erro do banco vira o 409 genérico.
  - O nome é único só entre as receitas ativas, e a comparação **não** diferencia maiúsculas de minúsculas: "Bolo" e "bolo" são o mesmo nome (índice `uk_receita_empresa_nome_ativa_ci`, em `lower(nome)`). Reativar uma receita cujo nome já foi usado por outra ativa dá 409, e a tela precisa tratar.
- **`movimentacao`:** nos motivos `ajuste` e `outro`, e em `motivo_perda = outro`, a justificativa precisa ter ao menos um caractere que não seja espaço, tab ou quebra de linha (`ck_mov_justificativa`).
- **Novas migrações** (inclusive o `permissao` do HU007): usar **V10 ou maior**, e quem tiver uma branch com migração faz rebase depois do merge do HT035. As versões V2 a V7 são do HT035; V8 e V9 são da HU015 (receitas).

### Bancos

| Banco | Situação |
|---|---|
| Desenvolvimento (Neon, compartilhado) | Baseline na V1 feito em 09/10/2026. V2 a V7 (HT035) aplicadas em 20/10/2026, por isso esses arquivos não podem mais ser editados. |
| Produção (Neon `is-toque-prod`, repositório `is.toque_prod`) | Esquema igualado ao da V1 em 09/10/2026, com os dados que já existiam, e baseline na V1 feito no mesmo dia. A API publicada já roda o backend da `main` com Flyway: no boot, o Flyway encontra a V1 marcada e não roda nada. |
