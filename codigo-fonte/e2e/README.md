# Testes e2e do Is.toque (Playwright)

Suíte de testes ponta a ponta do Is.toque, escrita com Playwright no padrão de arquitetura da GAC/Prodemge (Page Object Model + camada de Flows). Ela abre o front React em um navegador de verdade, conversa com o back Spring Boot local e valida o que o usuário vê.

> **Esta pasta é versionada** (entrou no repositório pelo PR #124). Ficam fora do git só os arquivos gerados: `node_modules/`, `test-results/`, `playwright-report/`, `blob-report/`, `storageState-*.json`, `.massa-e2e.json` e `_backup_testes_antigos/` (veja `.gitignore` desta pasta). Não versione senha de banco, connection string nem qualquer credencial real.

## Sumário

1. [O que a suíte cobre](#1-o-que-a-suíte-cobre)
2. [Pré-requisitos](#2-pré-requisitos)
3. [Preparar o ambiente](#3-preparar-o-ambiente)
4. [Como rodar](#4-como-rodar)
5. [Papéis e usuários de teste](#5-papéis-e-usuários-de-teste)
6. [Massa de dados e limpeza](#6-massa-de-dados-e-limpeza)
7. [Casos de teste](#7-casos-de-teste)
8. [Arquitetura e convenções](#8-arquitetura-e-convenções)
9. [Como adicionar um teste](#9-como-adicionar-um-teste)
10. [Solução de problemas](#10-solução-de-problemas)
11. [Limitações e pendências](#11-limitações-e-pendências)

## 1. O que a suíte cobre

- Fluxos com tela que usam a API: cadastro de empresa, login, logout, sessão (persistência, expirada, token inválido, 401 durante uma operação), produtos (cadastro, edição, foto), categorias, unidades de medida, estoque, detalhe do produto, painel, reposição, isolamento entre empresas.
- Fluxos que funcionam sem sessão: modo demonstração, página inicial, página 404, recuperação de acesso (simulada).
- Telas que só guardam dados em memória (equipe, movimentações, receitas, relatórios): por enquanto só o aviso "Esta tela ainda não grava no servidor...".

Cada fluxo tem pelo menos um teste positivo e um negativo (veja o item 11 para as exceções). Todo negativo valida a mensagem exibida na tela e que nada foi gravado; todo positivo valida a mensagem de sucesso e o resultado persistido.

Se um teste encontrar um bug real, ele **deve falhar**. Não ajuste a asserção para "fazer passar" um comportamento errado.

## 2. Pré-requisitos

| Item | Versão / observação |
|---|---|
| Node.js | 22 ou superior (testado com 24) |
| Playwright | 1.64.1 (fixado em `package.json`) |
| Java | JDK 21 ou superior para subir o back |
| Banco | Postgres. Use uma **branch Neon só de testes** (`e2e-teste`) ou um Postgres local |
| Sistema | Windows com PowerShell ou Git Bash |

Máquina modesta: rode só Chromium e com um worker (`--workers=1`, já é o padrão dos scripts).

## 3. Preparar o ambiente

### 3.1. Instalar as dependências

Dentro desta pasta (`codigo-fonte/e2e`):

```powershell
npm install
npx playwright install chromium
```

Firefox e WebKit só são necessários se você for rodar os scripts sem o sufixo `:chrome`: `npx playwright install firefox webkit`.

### 3.2. Subir o back apontando para o banco de testes

**Nunca rode os testes contra produção nem contra o banco de desenvolvimento compartilhado.** O `application.properties` do back aponta por padrão para o banco compartilhado, então sobrescreva a conexão por variáveis de ambiente, usando a connection string da branch `e2e-teste` (console do Neon):

```powershell
cd codigo-fonte\Backend\istoque
$env:SPRING_DATASOURCE_URL = "jdbc:postgresql://<host-da-branch-e2e-teste>/is_toque_db?sslmode=require"
$env:SPRING_DATASOURCE_USERNAME = "neondb_owner"
$env:SPRING_DATASOURCE_PASSWORD = "<senha-da-branch>"
.\mvnw.cmd spring-boot:run
```

O back sobe em `http://localhost:8080`. Confirme com:

```powershell
curl.exe http://localhost:8080/actuator/health
```

Não grave a senha em arquivo versionado.

Se o Windows recusar o diretório temporário padrão (erro `Existing directory ... is not owned by`), use um diretório próprio:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.jvmArguments=-Djava.io.tmpdir=C:\temp\istoque-back"
```

### 3.3. O front

Não precisa subir. O `playwright.config.js` inicia o Vite na porta 5173 (`npm run dev` em `codigo-fonte/Frontend/istoque`) e reaproveita o servidor se ele já estiver rodando. O Vite faz proxy de `/api` para `http://localhost:8080`.

### 3.4. Configuração do ambiente de teste

`config/local.env.json` guarda as URLs (front, API, telas). `config/env.js` escolhe o arquivo pela variável `ENV` (padrão `local`). Para outro ambiente, crie `config/<nome>.env.json` com as mesmas chaves e rode com `ENV=<nome>`.

## 4. Como rodar

Todos os comandos são rodados **dentro de `codigo-fonte/e2e`**, com o back já no ar (item 3.2). A partir da raiz do repositório, o jeito mais simples de começar é abrir a UI do Playwright, onde você escolhe e roda os testes clicando:

```powershell
cd codigo-fonte\e2e
npm run local:administrador:test:ui
```

O trecho `administrador` do nome do script é o **papel** que roda os testes. Os papéis são `administrador`, `gerente` e `funcionario` (veja o item 5). Troque o nome para rodar com outro papel, por exemplo `npm run local:gerente:test:chrome`. Nem todo papel tem todos os scripts: o que roda nos três navegadores (`local:administrador:test`) existe só para o `administrador`. Para abrir a UI com todos os papéis juntos, use `npm run local:test:ui`. Atenção: o gerente e o funcionário só rodam o CT_#0006, e os demais testes são ignorados nesses papéis (`test.skip`), então a UI deles mostra quase tudo como ignorado. A tabela abaixo lista o que existe.

### 4.1. Scripts

| Script | O que faz |
|---|---|
| `npm run local:administrador:test:ui` | Abre a UI do Playwright com o projeto do administrador |
| `npm run local:gerente:test:ui` | Abre a UI do Playwright com o projeto do gerente |
| `npm run local:funcionario:test:ui` | Abre a UI do Playwright com o projeto do funcionário |
| `npm run local:administrador:test:chrome` | Roda no Chromium abrindo a janela do navegador |
| `npm run local:administrador:test:chrome:headless` | Roda no Chromium sem abrir janela |
| `npm run local:gerente:test:chrome` | Roda os testes do papel gerente (Chromium) |
| `npm run local:gerente:test:chrome:headless` | Papel gerente no Chromium, sem janela |
| `npm run local:funcionario:test:chrome` | Roda os testes do papel funcionário (Chromium) |
| `npm run local:funcionario:test:chrome:headless` | Papel funcionário no Chromium, sem janela |
| `npm run local:dev:test:chrome:headless` | Roda os três papéis no Chromium, sem janela |
| `npm run local:administrador:test` | Administrador em Chromium, Firefox e WebKit |
| `npm run local:test` | Todos os papéis em todos os navegadores |
| `npm run local:test:ui` | UI do Playwright com todos os projetos |
| `npm run report` | Abre o último relatório HTML |
| `npm run lint` | Roda o ESLint |
| `npm run validar:autenticacao` | Confere a configuração de papéis e usuários |

### 4.2. Filtros úteis

Os títulos dos testes carregam tags entre colchetes, usadas com `--grep`:

```powershell
npm run local:administrador:test:chrome:headless -- --grep "\[login\]"
npm run local:administrador:test:chrome:headless -- --grep "\[CT_#0027\]"
npm run local:administrador:test:chrome:headless -- --grep "\[produto_cadastro\]|\[estoque\]"
npm run local:administrador:test:chrome:headless -- --grep-invert "\[limpeza\]"
npm run local:administrador:test:chrome:headless -- --grep "\[CT_#0027\]" --repeat-each=5
npm run local:administrador:test:ui -- --grep "\[login\]"
```

Tags principais: `login`, `logout`, `cadastro_empresa`, `sessao`, `demonstracao`, `landing`, `pagina_404`, `recuperar_acesso`, `produto_cadastro`, `produto_edicao`, `categoria`, `unidades_medida`, `estoque`, `produto_detalhe`, `produto_desativado`, `painel`, `alertas`, `reposicao`, `telas_locais`, `limpeza`.

Para rodar um arquivo ou uma pasta, passe o caminho:

```powershell
npm run local:administrador:test:chrome:headless -- e2e/modulo_ISTOQUE/z_login
```

### 4.3. Variáveis de ambiente

| Variável | Efeito |
|---|---|
| `ENV` | Escolhe `config/<ENV>.env.json` (padrão `local`) |
| `HEADLESS=true` | Roda sem abrir a janela do navegador |
| `PAPEL_AUTENTICADO` | Papel lido por `config/usuarios.js` e usado por `validar-autenticacao.mjs` (padrão `administrador`) |
| `CI=true` | Roda só Chromium |

### 4.4. Rodar a limpeza

```powershell
npm run local:administrador:test:chrome:headless -- --grep "\[limpeza\]"
```

Veja o item 6.

## 5. Papéis e usuários de teste

| Papel | Perfil no sistema | Usado em |
|---|---|---|
| `administrador` | Administrador | quase todos os testes |
| `gerente` | Gerente | CT_#0006 |
| `funcionario` | Funcionário | CT_#0006 |

As credenciais ficam em `config/usuarios.js` (fonte única de papéis, e-mails e senhas de teste). O `global/global-setup.js` roda uma vez antes de tudo:

1. confere se a API responde em `/actuator/health` (se não responder, a suíte para com uma mensagem clara);
2. cria a empresa da suíte (`E2E Suite Automatizada LTDA`) e os três usuários, se ainda não existirem;
3. faz login pela tela de cada papel e salva a sessão em `storageState-istoque-<papel>.json`.

Os testes que exigem estar logado já começam com essa sessão; eles não fazem login na tela. Os arquivos `storageState-*.json` são gerados e ignorados pelo git.

O papel vem do nome do projeto do Playwright (`administrador-chromium` vira `administrador`) e cada teste usa `test.skip(papelAutenticado !== '...')` para rodar só no papel certo.

## 6. Massa de dados e limpeza

- Todo dado criado recebe um código único (`E2E` + data/hora + sequência) no nome do produto, categoria, razão social e e-mail.
- Testes que criam produtos guardam o que criaram em `testInfo['massaProduto']` e o `afterEach` desativa esses produtos pela API.
- Testes que precisam de uma empresa limpa criam uma **empresa isolada** pela API e registram o e-mail e a senha dela em `.massa-e2e.json` (ignorado pelo git).
- `e2e/z_clean_up/limpar_ambiente_massa_testes.spec.js` percorre a empresa da suíte e as empresas registradas, desativa os produtos ativos e confere que não sobrou nenhum. Rode-o quando uma execução for interrompida no meio.

**A aplicação não tem exclusão** de empresas, usuários, categorias nem produtos (só desativar produto, e só pela API). Por isso o lixo que sobra no banco de teste é esperado. Para zerar tudo, **resete a branch `e2e-teste` a partir do pai no console do Neon**; a suíte não faz reset nem executa SQL.

## 7. Casos de teste

Numeração `[CT_#NNNN]`, sem repetição. O CT_#0022 foi removido (veja o item 11).

| Fluxo | CTs | Positivo / negativo |
|---|---|---|
| Login | 0001 a 0007 | 0001, 0006, 0007 / 0002 a 0005 |
| Cadastro de empresa | 0008 a 0012 | 0008 / 0009 a 0012 |
| Logout | 0013, 0014 | 0013 / 0014 |
| Sessão | 0015 a 0018, 0060 | 0015, 0060 / 0016 a 0018 |
| Modo demonstração | 0019, 0020 | 0019 / 0020 |
| Página inicial | 0021 | 0021 / (nenhum) |
| Página 404 | 0023, 0024 | 0024 / 0023 |
| Recuperar acesso | 0025, 0026 | 0025 / 0026 |
| Produto: cadastro | 0027 a 0032 | 0027, 0031 / 0028 a 0030, 0032 |
| Produto: edição | 0033 a 0035 | 0033 / 0034, 0035 |
| Categoria | 0036 a 0038 | 0036 / 0037, 0038 |
| Unidades de medida | 0039, 0040 | 0039 / 0040 |
| Estoque | 0041 a 0044 | 0041, 0044 / 0042, 0043 |
| Detalhe do produto | 0045, 0046 | 0045 / 0046 |
| Produto desativado e isolamento | 0047, 0048 | 0047 / 0048 |
| Painel | 0049, 0050 | 0049 / 0050 |
| Alertas | 0051, 0052 | 0051 / 0052 |
| Reposição | 0053, 0054 | 0053 / 0054 |
| Telas só locais | 0055, 0056 | 0055 / 0056 |
| Bloqueio de login e troca de senha (HT036) | 0057 a 0059 | 0059 / 0057, 0058 |

Para ver título, tags e arquivo de cada teste: `npx playwright test --list --project=administrador-chromium`.

## 8. Arquitetura e convenções

Cada camada só conhece a imediatamente abaixo:

```
e2e/        specs: cenário, hooks, skip por papel, validações
support/
  flows/    jornadas que combinam Pages ou chamadas à API (sem test() nem expect())
  pages/    uma classe por tela; cada método é uma ação do usuário
  locators/ só seletores (XPath)
fixtures/   dadosBasicos.json (textos e mensagens), fixtures do Playwright, arquivos de apoio
config/     URLs por ambiente e usuários por papel
global/     global-setup.js (login por papel)
```

```
config/            env.js, local.env.json, usuarios.js
global/            global-setup.js
fixtures/          usuario_autenticado.fixture.js, nao_autenticado.fixture.js, dadosBasicos.json,
                   imagem-valida.png, arquivo-invalido.txt
support/locators/  comunsLocators.js, loginLocators.js, logoutLocators.js, modulo_ISTOQUE/*Locators.js
support/pages/     HelpersPage.js, ComunsPage.js, LoginPage.js, LogoutPage.js, modulo_ISTOQUE/*Page.js
support/flows/     LoginFlows.js, LogoutFlows.js, EmpresaFlows.js, ProdutoFlows.js
e2e/modulo_ISTOQUE/<funcionalidade>/testes_{sucesso|negativo}_<funcionalidade>.spec.js
e2e/modulo_ISTOQUE/z_login/ e z_logout/
e2e/z_clean_up/
_backup_testes_antigos/   suíte anterior (fora da execução)
```

Regras do projeto:

- **Sem comentários no código.** A única exceção é o bloco `console.info` com a descrição do teste, em todo teste.
- **Proibido `waitForTimeout`.** As esperas são condicionais, feitas pelos métodos da `HelpersPage`.
- Nenhum spec chama `page.locator(...)` direto: toda interação passa por um método de Page.
- A Page recebe só `page` no construtor, pode instanciar outra Page e nunca instancia um Flow.
- Nomes de métodos começam com verbo no infinitivo (`preencherCampo`, `validarMensagemToast`).
- Textos visíveis nunca ficam fixos no seletor: o locator é uma função (`getBotao(nome)`) e o texto vem de `fixtures/dadosBasicos.json`, importado inteiro e usado por desestruturação (`const { botao, campo } = dados;`).
- Credenciais ficam só em `config/usuarios.js`; URLs só em `config/*.env.json`; nada disso vai para o `dadosBasicos.json`.
- Seletores repetidos em mais de um arquivo vão para `comunsLocators.js`. Tabelas usam a linha do registro e o cabeçalho com `count()`, nunca `td[3]`.
- Páginas e Flows são instanciados dentro de cada hook ou teste, nunca no escopo do `describe`. Cada teste é independente.
- Dados únicos gerados no teste vão para `testInfo['chaveDescritiva']` para o `afterEach` limpar.
- IDs no título: `[CT_#0001] Título [tag]`.
- Formato: ponto e vírgula obrigatório (`npm run lint`), sem linhas em branco entre instruções do mesmo contexto.
- Chamadas de negócio à API (criar empresa, usuário, produto, desativar) ficam em `EmpresaFlows` e `ProdutoFlows` (`page.request`). A `HelpersPage` só tem o que é genérico: esperas, `localStorage`, contagem de chamadas à API, mocks com `page.route`, geração de códigos.

Observação sobre locators: o front não tem `data-testid`. Onde não há `name`, `aria-*` ou `role`, os seletores usam classes de componente (`product-card`, `topbar`, `toast`). Se o front mudar essas classes, ajuste só os arquivos de `support/locators/`.

## 9. Como adicionar um teste

1. **Dados**: coloque textos e mensagens novos em `fixtures/dadosBasicos.json`, na categoria certa (`botao`, `campo`, `mensagem`, `titulo`, `rotulo`...). O valor é o texto exato exibido pela tela.
2. **Locator**: crie ou amplie `support/locators/modulo_ISTOQUE/<tela>Locators.js`. Confirme no DevTools que o XPath devolve um único elemento.
3. **Page**: crie ou amplie `support/pages/modulo_ISTOQUE/<Tela>Page.js` com ações atômicas e validações pontuais.
4. **Flow**: só se a mesma sequência se repetir em mais de um spec ou hook. Se a sequência é o objetivo do teste, deixe os passos visíveis no spec.
5. **Spec**: `e2e/modulo_ISTOQUE/<funcionalidade>/testes_sucesso_<funcionalidade>.spec.js` e o `testes_negativo_...` correspondente. Use o próximo número de CT livre.
   - Logado: importe de `fixtures/usuario_autenticado.fixture.js`.
   - Sem sessão: importe de `fixtures/nao_autenticado.fixture.js` (use o parâmetro `nao_autenticado` como página).
6. Rode o teste sozinho, depois com `--repeat-each=5` para checar estabilidade, e depois `npm run lint`.

**Novo papel**: adicione em `config/usuarios.js`, em `global/global-setup.js` e em `playwright.config.js`, e crie os scripts `local:<papel>:test:chrome` no `package.json`.

## 10. Solução de problemas

| Sintoma | Causa e solução |
|---|---|
| `A API não respondeu em http://localhost:8080/actuator/health` | O back não está no ar. Veja o item 3.2 |
| `npm error ENOENT ... package.json` | O comando foi rodado fora de `codigo-fonte/e2e`. Entre na pasta |
| Back não sobe: `Existing directory ... is not owned by` | Use o `-Djava.io.tmpdir` do item 3.2 |
| Vários testes falham com `worker process exited unexpectedly (code=3221225794)` | O Windows não conseguiu iniciar o worker depois de um teste que falhou, por falta de recursos. Feche UIs do Playwright, Vite e navegadores sobrando e rode uma execução por vez com `--workers=1` |
| `Executable doesn't exist` (Firefox ou WebKit) | Rode `npx playwright install firefox webkit` ou use os scripts `:chrome` |
| Porta 5173 ocupada com outro app | O `webServer` usa `--strictPort`. Pare o outro processo ou reaproveite o Vite do front |
| Testes passam sozinhos e falham juntos | Dois Playwright rodando ao mesmo tempo (por exemplo UI aberta e terminal) compartilham a empresa da suíte e os `storageState`. Rode um por vez |
| Falhou no meio e ficaram produtos ativos | Rode a limpeza (item 4.4) |
| Sessões estranhas | Apague `storageState-*.json` e `.massa-e2e.json`; o `global-setup` recria os arquivos de sessão |
| Mensagem de erro de API diferente da esperada | Confira se o back rodando é o da `main` atual (as permissões por perfil da HU007 mudaram as respostas 403) |

Depois de uma falha, abra o relatório (`npm run report`) ou o trace (`npx playwright show-trace test-results/<pasta>/trace.zip`).

## 11. Limitações e pendências

- **Página inicial sem teste negativo.** O CT_#0022 verificava que as perguntas frequentes não exibem texto-modelo entre colchetes (`[Definir as condições de uso...]`, `[e-mail de contato]`). Ele falhava por um bug de conteúdo real e foi removido a pedido; o fluxo da página inicial ficou só com o CT_#0021. O conteúdo ainda está no front (`features/landing/components/faq-section.jsx`).
- **Telas sem teste e2e**: movimentação de estoque, receitas, produção, relatórios, equipe, importação de nota e navegação pelo menu. Essas telas só guardam dados em memória.
- **HT036 sem tela de troca de senha.** O front não tem tela para trocar a senha; o CT_#0058 e o CT_#0059 trocam a senha pela API (`PATCH /api/usuarios/me/senha`) e conferem o efeito na tela de login.
- **Permissões por perfil (HU007) sem teste de tela.** O back já devolve 403 para o Funcionário em operações de gerenciamento (por exemplo criar produto ou categoria). Um teste de tela para isso ainda não existe; hoje gerente e funcionário só têm o CT_#0006.
- **Mensagem genérica no 409.** Produto ou categoria duplicados mostram "A operação viola uma restrição de integridade dos dados". Os CTs 0030, 0035 e 0038 não fixam esse texto, só que um erro aparece e nada foi gravado. A mensagem é uma melhoria sugerida para o front/back.
- **Sem guarda de rota.** Sem sessão, qualquer rota interna abre em modo demonstração, em vez de ir para o login. O CT_#0014 valida esse comportamento atual.
- **Alertas sem mensagem de vazio.** O modal "Sua cozinha pede atenção" abre sem textos quando não há pendências.
- **Sem exclusão pela aplicação** (veja o item 6).
