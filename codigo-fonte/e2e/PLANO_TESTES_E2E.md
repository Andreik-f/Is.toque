# PLANO_TESTES_E2E – Is.toque (padrão GAC: Page Object + Flows)

> Este é o conteúdo de `PLANO_TESTES_E2E.md`. O modo de planejamento só me deixa gravar este arquivo. Quando você aprovar, eu o copio para `e2e/PLANO_TESTES_E2E.md` e começo a Fase 3 pelo backup.

> Atualização: a pasta de testes foi movida para `codigo-fonte/e2e` e o CT_#0022 (texto-modelo no FAQ da página inicial) foi removido a pedido. Veja o README.md desta pasta.

## Ajustes aprovados pelo usuário (prevalecem sobre o texto abaixo)

1. **Produção**: testes de produção descartados (`playwright.producao.config.js`, `env.producao.js`, `global-setup.producao.js`, `LoginProducaoFlows`, `SessaoProducaoPage`); só vão para `_backup_testes_antigos/`. Suíte só local.
2. **Chamadas de negócio à API** (criar empresa/usuário/produto, desativar) ficam em `EmpresaFlows` e `ProdutoFlows`, usando `page.request`. `HelpersPage` só tem o genérico (esperas, localStorage, contagem de chamadas, mocks com `page.route`, geração de código único).
3. **CT_#0030, 0035 e 0038**: validar que **um erro é exibido** (elemento de erro visível e não vazio) e que **nada foi gravado**; **não fixar** o texto genérico do 409. A mensagem "A operação viola uma restrição de integridade dos dados" vai para o relatório final como melhoria.
4. **CT_#0052 (sem mensagem de vazio) removido**; a ausência fica como lacuna de UX (§8). Novo negativo de alertas com resultado definido: **CT_#0052 − "Sem pendências, o sino não mostra o ponto indicador"**. Empresa isolada sem produtos; o botão "Ver alertas" não contém o ponto `<i>`; ao abrir, o modal "Sua cozinha pede atenção" não lista itens (nenhum `button.list-link`). O número é reaproveitado porque o antigo foi removido (me diga se prefere outro). A existência do ponto será conferida na tela real antes de gravar.
5. **Bug conhecido** (CT_#0022): tag `[bug_conhecido]` no título, **sem `test.fail()`**. O critério de "duas execuções estáveis" aceita apenas as falhas listadas com essa tag.
6. **Implementar só até CT_#0056 e parar para revisão.** CT_#0057–0074 (movimentação, receitas, produção, relatórios, equipe, importação, navegação) ficam para depois da revisão.
7. **Limpeza**: `z_clean_up` desativa via API o que for possível e **confere que não restaram produtos ativos** nas empresas E2E. Nada de reset de branch nem SQL dentro da suíte (o reset é manual, por você). Como o `z_clean_up` descobre as empresas E2E: `EmpresaFlows` registra cada empresa criada (e-mail, senha) em `.massa-e2e.json` (ignorado pelo git, só para limpeza; o `testInfo` continua sendo o canal dentro do teste).
8. **Branch Neon**: nova branch chamada **`e2e-teste`** (não reutilizar `seguranca-teste`). **Peço sua confirmação antes de criar.**
9. **PDFs da GAC prevalecem** (já lidos: arquitetura v2, agente gerador de XPath v1 e lista de exercícios; `e2e/docs-referencia-e2e/` ainda não existe, li direto de `.claude/uploads`). Divergências encontradas e como resolvi:
   - Versões: mantenho o **Playwright 1.64.1** que o projeto já usa (a fixação em 1.58.0 do PDF é do ambiente da Prodemge, não do padrão de arquitetura). O resto do padrão (scripts, cross-env, estrutura) segue o PDF.
   - Scripts npm no padrão do PDF: `local:{papel}:test`, `local:{papel}:test:chrome`, `local:{papel}:test:chrome:headless`, `local:{papel}:test:ui`, mais `report` e `validar-autenticacao.mjs`, com `cross-env ENV=local`. O ambiente padrão em `env.js` é `local` (`config/local.env.json` com URLs de login, autenticada e logout).
   - O PDF tem comentários nos exemplos; a sua regra "código sem comentários" prevalece (só o `console.info` de descrição).
   - Formato: sem linhas em branco entre instruções do mesmo contexto; ESLint só para ponto e vírgula; `test.skip` por papel em `beforeEach`, `afterEach` e início do teste; também nos specs públicos (`papelAutenticado !== 'administrador'`) para não repetir 3x por papel.
   - Exercício CT_#0004 do PDF espera que, depois do logout, abrir a URL inicial **permaneça no login**. No Is.toque não existe guarda de rota (abre a demonstração). Mantive o CT_#0014 como está (valida o comportamento real) e registrei a divergência com o padrão GAC em §8; se você quiser tratá-lo como bug, vira `[bug_conhecido]`.
   - Locators do PDF/agente XPath: no máximo o necessário, preferir estrutura repetitiva → registro → `count()` por cabeçalho → atributos estáveis → `normalize-space()`. As classes `product-card`, `access-field-error`, `toast` etc. são o único recurso estável em vários pontos (não há `data-testid`); uso com justificativa e registro como sugestão.
10. `.git/info/exclude` recebe a regra `e2e/`; `back-e2e.jar` e os relatórios antigos vão para o backup (fora da execução).

## 0. Contexto e decisões já tomadas

- Projeto de testes: `e2e/` (já ignorado em `.gitignore` da raiz). Será reescrito; o conteúdo atual vai para `e2e/_backup_testes_antigos/` antes de qualquer mudança.
- Alvo: `main` atual (HU007/permissões por perfil fica como lacuna).
- Banco: **branch Neon só de teste**. Na Fase 3 eu peço sua confirmação antes de criar a branch e uso a connection string dela por variáveis de ambiente (`SPRING_DATASOURCE_URL/USERNAME/PASSWORD`), nunca o dev compartilhado nem produção.
- Escopo: fluxos com tela são testados pela UI. Fluxos sem tela (usuários, empresa, perfis, troca de senha, desativar produto) não têm CT de UI; a API só entra como **apoio** (massa e limpeza), dentro de `EmpresaFlows`/`ProdutoFlows` (via `page.request`).
- Stack real: back **Spring Boot 4.1.1 / Java 21** (seu texto diz Boot 3 / Java 17), front React com Vite, rotas por **hash** (`/#login`).
- Referências da GAC: os 3 PDFs foram lidos; o projeto modelo `orangeHRM-e2e-playwright_teste` está em `e2e/docs-referencia-e2e/` e será lido antes da implementação. Em divergência, os PDFs prevalecem (exceto a versão do Playwright).

### Descobertas que mudam o desenho (resumo da Fase 1)

1. **Não existe guarda de rota.** Sem sessão, qualquer `#rota` abre o app em **modo demonstração** (dados fictícios, "Protótipo interativo"), sem redirecionar ao login. O redirecionamento para `#login` só acontece com token vencido ao carregar a página ou 401 em rota autenticada.
2. Com sessão, só **autenticação, produtos, categorias e unidades de medida** usam a API. Movimentações, receitas, produção, relatórios, equipe, foto e importação são **só em memória** (o front avisa na tela).
3. **Não existe desativar/reativar produto no front.** Só há `PATCH /api/produtos/{id}/desativar` na API. Categorias só são criadas dentro do modal de produto; unidades só são listadas.
4. **Permissão só no servidor**: apenas Administrador × demais, e só em usuários e empresa. O front não tem rotas para isso e não oculta nada por perfil. Gerente e Funcionário são idênticos para o servidor em `main`.
5. **Não há `data-testid`.** Os `id` do login/cadastro vêm de `useId()` (instáveis). Os campos de login/cadastro têm `name`; os do modal de produto ficam dentro de `<label class="field"><span>Rótulo</span><input>` (sem `id`/`name` no input de texto; selects/checkbox têm `name`). Os campos do modal de movimentação não têm `name`/`id`.
6. Não há API de movimentação, lote, produção, relatórios nem foto, embora existam as tabelas.

## 1. Inventário de fluxos

| ID | Fluxo | Fonte |
|---|---|---|
| F01 | Cadastro de empresa (cria empresa + admin e já entra) | `#cadastro`, `POST /api/auth/cadastro`, HU001, RF-01/02 |
| F02 | Login | `#login`, `POST /api/auth/login`, HU002, RF-03 |
| F03 | Logout | botão "Sair" (sidebar), só cliente |
| F04 | Sessão: persistência, expirada, token inválido, 401 durante operação | `istoque.sessao`, `session-store.jsx`, RNF-04 |
| F05 | Acesso sem sessão / modo demonstração / reiniciar demonstração | `app/router.jsx`, `config/demo.js` |
| F06 | Landing e CTAs | `#inicio`, `/` sem sessão |
| F07 | Página 404 (hash e caminho inválidos) | `app/routes/not-found.jsx`, PR #122 |
| F08 | Recuperar acesso (simulado) | `#recuperar` |
| F09 | Produto: cadastro (com foto opcional) | modal "Novo produto", `POST /api/produtos`, HU005, RF-07..10 |
| F10 | Produto: edição | modal "Editar produto", `PUT /api/produtos/{id}` |
| F11 | Categoria (criada no modal de produto) | `POST /api/categorias` |
| F12 | Unidades de medida (listagem/preservação) | `GET /api/unidades-medida`, RF-08 |
| F13 | Estoque: listagem, busca, filtros, estados vazios | `#estoque` |
| F14 | Detalhe do produto e produto inexistente | `#produto/{id}` |
| F15 | Produto desativado e isolamento por empresa | `PATCH /produtos/{id}/desativar` (só API), RE-01, RF-37 |
| F16 | Painel (dashboard) com dados da API e falha de carregamento | `#dashboard`, `company-data.jsx` |
| F17 | Alertas (sino) | modal "Sua cozinha pede atenção" |
| F18 | Reposição | `#reposicao`, HU014 |
| F19 | Telas só locais (aviso "não grava no servidor") | `app-layout.jsx:53-61` |
| F20 | Movimentação de estoque (local) | modal "Movimentar estoque", HU008/010/011 (front) |
| F21 | Receitas / ficha técnica (local) | `#receitas`, HU015 (front) |
| F22 | Produção (local) | modal "Registrar produção", HU017 (front) |
| F23 | Relatórios (local) | `#relatorios`, HU019 (front) |
| F24 | Equipe (local) e papéis visíveis | `#equipe` |
| F25 | Importação de nota (simulada) | `#importacao` |
| F26 | Navegação pelo menu | sidebar |

**Sem tela (fora da UI, registrados como lacuna):** empresa (`GET/PUT /api/empresas/minha`, HU006), usuários (CRUD, HU003), troca de senha (RF-39/HU020), perfis, reativação (HU003/HU009), foto no servidor (HU018).

## 2. Matriz de casos de teste

Convenções: **Papel** padrão = `administrador`. **Limpeza** padrão = nenhuma (o teste não grava). Onde há produto criado, a limpeza é "desativar via API no `afterEach`" (chave `testInfo['massaProduto']`). "Empresa isolada" = o teste cria empresa nova pela API (CNPJ e e-mail únicos com o código do teste) e injeta a sessão. Mensagens são literais do código; as marcadas **(a confirmar)** dependem de como o front renderiza o erro da API e serão conferidas na tela real antes de gravar no JSON.

### F02 Login (`z_login`, sem sessão salvo onde indicado)
| CT | Tipo | Título | Papel | Pré | Passos | Esperado | Fonte |
|---|---|---|---|---|---|---|---|
| CT_#0001 | + | Login válido entra no painel | não autenticado | Empresa isolada | Abrir login, informar e-mail/senha, Entrar | URL `#dashboard`; selo "Conectado ao servidor"; sessão com token e `expiraEm` futuro; sem aviso de sessão expirada | HU002 |
| CT_#0002 | − | Senha errada | não autenticado | Empresa isolada | Entrar com senha errada | "E-mail ou senha incorretos."; segue em `#login`; sem sessão; sem "Sua sessão expirou. Entre novamente." | AuthService |
| CT_#0003 | − | Campos vazios | não autenticado | — | Entrar sem preencher | "Informe seu e-mail." e "Informe sua senha."; nenhuma chamada à API | validation.js |
| CT_#0004 | − | E-mail inválido | não autenticado | — | `usuario-sem-arroba` + senha | "Digite um e-mail válido."; nenhuma chamada à API | validation.js |
| CT_#0005 | − | E-mail inexistente | não autenticado | — | E-mail único que não existe | "E-mail ou senha incorretos."; sem sessão | AuthService |
| CT_#0006 | + | Login por perfil mostra nome e perfil | gerente, funcionario | Usuário criado no global-setup | Abrir `#dashboard` com a sessão do papel | Rodapé do menu mostra o nome e o perfil ("Gerente"/"Funcionário"); mesmos itens de menu do administrador | HU004 |
| CT_#0007 | + | Mostrar/ocultar senha | não autenticado | — | Clicar em "Mostrar: senha" | `aria-pressed=true` e campo `type=text`; depois "Ocultar: senha" | auth-controls |

### F01 Cadastro de empresa
| CT | Tipo | Título | Papel | Pré | Passos | Esperado | Limpeza | Fonte |
|---|---|---|---|---|---|---|---|---|
| CT_#0008 | + | Cadastro cria empresa e já entra | não autenticado | CNPJ/e-mail únicos | Preencher todos os campos, "Criar conta" | `#dashboard`; sessão gravada; chamadas seguintes com `Bearer`; sair e entrar com as mesmas credenciais funciona (persistido) | empresa fica no banco de teste (ver §6) | HU001 |
| CT_#0009 | − | Campos obrigatórios vazios | não autenticado | — | "Criar conta" sem preencher | "Informe a razão social.", "Informe o CNPJ.", "Informe o nome do responsável.", "Informe seu e-mail.", "Informe sua senha.", "Confirme sua senha."; sem envio à API | — | validation.js |
| CT_#0010 | − | Formatos inválidos | não autenticado | — | CNPJ `12.345`, e-mail sem `@`, senha `curta12`, confirmação diferente | "O CNPJ deve ter 14 caracteres, com ou sem máscara.", "Digite um e-mail válido.", "A senha deve ter no mínimo 8 caracteres.", "As senhas precisam ser iguais."; sem envio | — | validation.js |
| CT_#0011 | − | CNPJ já cadastrado | não autenticado | Empresa criada via API | Cadastrar outra com o mesmo CNPJ | "Já existe uma empresa cadastrada com o CNPJ: {CNPJ formatado}" (a confirmar); segue em `#cadastro`; sem sessão; nada novo gravado | — | CnpjJaCadastradoException, RE-13 |
| CT_#0012 | − | E-mail já cadastrado | não autenticado | Usuário criado via API | Cadastrar empresa nova com o mesmo e-mail | "Já existe um usuário cadastrado com o e-mail {email}." (a confirmar); a empresa nova não é criada | — | EmailJaCadastradoException |

### F03 Logout (`z_logout`)
| CT | Tipo | Título | Papel | Pré | Passos | Esperado | Fonte |
|---|---|---|---|---|---|---|---|
| CT_#0013 | + | Sair encerra a sessão | administrador | — | Clicar em "Sair" | `#login`; `istoque.sessao` ausente; sem aviso de sessão expirada | sidebar.jsx |
| CT_#0014 | − | Após sair, a empresa não é acessível | administrador | — | Sair e abrir `#estoque` | Modo demonstração ("Protótipo interativo", rodapé "Dados fictícios • alterações duram até recarregar"); nenhuma chamada autenticada à API; produtos da empresa não aparecem | RE-01 |

### F04 Sessão
| CT | Tipo | Título | Papel | Esperado | Fonte |
|---|---|---|---|---|---|
| CT_#0015 | + | Recarregar mantém a sessão | administrador | `#dashboard` após reload; mesma sessão; ≥1 chamada e todas com `Bearer` | session-store |
| CT_#0016 | − | Token adulterado | administrador | `#login` com exatamente 1 "Sua sessão expirou. Entre novamente."; chamadas com 401; 1 navegação para o login; sessão apagada | RestAuthenticationEntryPoint |
| CT_#0017 | − | `expiraEm` no passado | nao autenticado (sessão forjada) | `#login` com 1 aviso; 0 chamadas à API; sessão apagada | session-storage.js |
| CT_#0018 | − | 401 durante operação fecha o modal | administrador | Mock `POST /api/produtos` → 401 ("Sessão expirada ou inválida. Entre novamente."): vai para `#login` com 1 aviso; após novo login o modal "Novo produto" não reaparece (achado da revisão HT001) | revisoes/PR-feat-ht001-front |

### F05 Modo demonstração (sem sessão)
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0019 | + | Rotas internas abrem em demonstração | Para `dashboard, estoque, produto/tomate, receitas, receita/burger, reposicao, relatorios, equipe, movimentacoes, importacao, fluxos`: rota, h1 e menu corretos; "Protótipo interativo"; 0 chamadas à API | demo |
| CT_#0020 | − | Demonstração não persiste nem fala com a API | Alterar algo (ex.: nova movimentação), recarregar: volta ao inicial; "Reiniciar demonstração" mostra o toast "Demonstração reiniciada."; 0 chamadas à API | demo |

### F06 Landing
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0021 | + | CTAs da landing | h1 "Saiba quantas porções a sua cozinha consegue fazer hoje."; "Criar conta da empresa" → `#cadastro`; "Entrar" → `#login`; 0 chamadas à API | landing |
| CT_#0022 | − | Landing não deve exibir texto-modelo `[bug_conhecido]` | Nenhum texto entre colchetes tipo "[Definir as condições de uso…]" nas respostas do FAQ. **Falha hoje** (3 placeholders em `faq-section.jsx`), sem `test.fail()` | faq-section.jsx |

### F07 Página 404
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0023 | − | Rota inválida mostra 404 | `#xyz` e depois caminho `/abc` (com sessão ativa): "ERRO 404", "Essa prateleira está vazia.", texto com o endereço digitado dentro de `code`; sessão mantida | not-found.jsx |
| CT_#0024 | + | Botões do 404 levam ao app | "Voltar à visão geral" → `#dashboard`; "Ir para o estoque" → `#estoque` | not-found.jsx |

### F08 Recuperar acesso
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0025 | + | Simular recuperação | "Esqueceu a senha?" abre "Recuperar acesso"; e-mail válido + "Simular recuperação" → "Simulação concluída. Nenhum e-mail foi enviado."; 0 chamadas à API | auth-screen.jsx |
| CT_#0026 | − | E-mail vazio | Modal permanece; sem "Simulação concluída…"; campo e-mail inválido (validação nativa `valueMissing`) | auth-screen.jsx |

### F09 Produto: cadastro
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0027 | + | Cadastrar produto | Toast "Produto cadastrado com saldo inicial zero."; card no estoque (busca pelo nome); API: `ativo`, mínimo, máximo, `quantidadeAtual` 0 | HU005 |
| CT_#0028 | − | Formulário vazio | Campos nome/mínimo/máximo inválidos (nativo); modal aberto; 0 gravações | modal |
| CT_#0029 | − | Máximo menor que o mínimo | "O estoque máximo precisa ser maior ou igual ao mínimo."; 0 gravações | RE-12 |
| CT_#0030 | − | Nome duplicado | Resposta 409; um erro é exibido (texto não fixado); só existe 1 produto com o nome | V1 índice único |
| CT_#0031 | + | Foto válida (PNG) | Botão passa a "Substituir foto"; aparece "Remover foto"; toast acrescenta " A foto ainda fica só nesta página." | HU018 (front) |
| CT_#0032 | − | Foto em formato inválido | "Formato não aceito. Escolha uma imagem JPG, PNG ou WebP."; produto não é salvo com foto | product-modal |

### F10 Produto: edição
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0033 | + | Editar produto | Toast "Produto atualizado."; após reload nome/mín/máx novos; API confere | HU005 |
| CT_#0034 | − | Mínimo maior que o máximo | "O estoque máximo precisa ser maior ou igual ao mínimo."; API mantém os valores anteriores | RE-12 |
| CT_#0035 | − | Renomear para nome existente | 409 e um erro é exibido (texto não fixado); nome do produto não muda | V1 índice único |

### F11 Categoria
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0036 | + | Criar categoria no cadastro de produto | "+ Nova categoria" → nome → salvar; aba da categoria no estoque; API lista a categoria | CategoriaController |
| CT_#0037 | − | Nova categoria sem nome | Campo "Nome da nova categoria" inválido (required); 0 gravações | modal |
| CT_#0038 | − | Categoria duplicada | 409 e um erro é exibido (texto não fixado); só 1 categoria com o nome; nenhum produto criado | V1 índice único |

### F12 Unidades de medida
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0039 | + | Select lista as unidades da API | Opções "Quilograma (kg)", "Litro (L)", "Unidade (un)" iguais ao `GET /unidades-medida` | V1/V6/V8 |
| CT_#0040 | − | Unidade não pode ser trocada na edição | Select desabilitado; dica "Unidade preservada para manter o histórico." | product-modal |

### F13 Estoque
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0041 | + | Buscar por nome | Só o card buscado; contador "1 produto" | estoque.jsx |
| CT_#0042 | − | Busca sem resultado | "Nenhum resultado" / "Tente outro termo ou remova os filtros."; "Limpar filtros" restaura a lista | estoque.jsx |
| CT_#0043 | − | Empresa nova sem produtos | Empresa isolada: "Nenhum produto cadastrado" / "Cadastre o primeiro produto para começar a controlar o estoque." | estoque.jsx |
| CT_#0044 | + | Filtro "Somente estoque baixo" | Produto com mínimo 1 e saldo 0 aparece com badge "Sem estoque"; produto sem mínimo não aparece | inventory.js |

### F14 Detalhe do produto
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0045 | + | Abrir detalhe pelo card | h1 "Detalhes do produto"; nome, categoria e "Estoque máximo" corretos; "← Voltar ao estoque" retorna | produto.jsx |
| CT_#0046 | − | Produto inexistente | `#produto/nao-existe`: "Produto não encontrado" / "Ele pode ter sido desativado. Volte ao estoque e escolha outro." | produto.jsx |

### F15 Desativado e isolamento
| CT | Tipo | Título | Esperado | Limpeza |
|---|---|---|---|---|
| CT_#0047 | + | Produto desativado some do estoque | Desativar via API (apoio); card some; `#produto/{id}` mostra "Produto não encontrado" | desativado pelo próprio teste |
| CT_#0048 | − | Produto de outra empresa não aparece | Segunda empresa isolada cria produto; admin da primeira não o vê no estoque; `#produto/{id}` → "Produto não encontrado" | desativar o da segunda |

### F16 Painel e F17 Alertas
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0049 | + | Painel reflete a API | "Produtos cadastrados" = quantidade de ativos; h1 "Tudo pronto para hoje?"; rodapé "Produtos e categorias salvos no servidor" | dashboard |
| CT_#0050 | − | Falha da API no carregamento | Mock 500: "Não foi possível carregar os dados" + "A API não respondeu. Verifique se ela está no ar e tente de novo."; "Tentar de novo" refaz a chamada; "Sair" volta ao login | company-data.jsx |
| CT_#0051 | + | Sino de alertas | Demonstração: "Sua cozinha pede atenção" com seções "Validade em até 3 dias" e "Estoque baixo"; clicar no item abre o produto | alerts-modal |
| CT_#0052 | − | Sem pendências, o sino não mostra o ponto indicador | Empresa isolada sem produtos: "Ver alertas" sem o ponto `<i>`; modal "Sua cozinha pede atenção" sem itens clicáveis. Ausência de mensagem de vazio = lacuna de UX (§8), não testada | alerts-modal |

### F18 Reposição
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0053 | + | Produto no mínimo entra na lista | Mín 1, máx 10, saldo 0 → linha com sugestão 10; contador do painel bate; "Registrar entrada" abre o modal | HU014 |
| CT_#0054 | − | Nada a repor | Empresa isolada: "Estoque abastecido" / "Nenhum produto está no mínimo ou abaixo dele." | reposicao |

### F19 Telas locais
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0055 | + | Aviso em telas só locais | `equipe, movimentacoes, receitas, relatorios`: "Esta tela ainda não grava no servidor: o que você registrar aqui vale até recarregar a página." | app-layout.jsx |
| CT_#0056 | − | Aviso ausente em telas com API | `dashboard, estoque, reposicao` não exibem o aviso | app-layout.jsx |

### F20 Movimentação (modal local; demonstração)
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0057 | + | Registrar entrada | Entrada com motivo ≥3 caracteres; toast "Movimentação registrada. Saldo atualizado."; saldo e histórico atualizados | movement-modal |
| CT_#0058 | + | Com sessão, aviso de não persistência | Empresa isolada + produto: toast "Movimentação registrada nesta página. Ela ainda não é gravada no servidor."; após reload saldo volta a 0 | app/modals.jsx |
| CT_#0059 | − | Saída maior que o saldo | "A quantidade supera o saldo disponível."; "Confirmar movimentação" desabilitado | inventory.js |
| CT_#0060 | − | Motivo curto | Motivo com 2 caracteres mantém "Confirmar movimentação" desabilitado | RF-16 |

### F21 Receitas
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0061 | + | Nova ficha técnica | Toast "Ficha técnica salva. O estoque não foi alterado."; card na lista | recipe-modal |
| CT_#0062 | − | Ingrediente repetido | "Cada ingrediente deve aparecer apenas uma vez." | RE-15 |
| CT_#0063 | − | Nome vazio | Campo "Nome da receita" inválido; modal aberto | recipe-modal |

### F22 Produção
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0064 | + | Registrar produção | "Produção registrada!"; "Concluir" fecha; saldos dos ingredientes baixam | HU017 (front) |
| CT_#0065 | − | Acima da capacidade | "Estoque insuficiente. Você pode produzir até {n} porção(ões)."; "Confirmar produção" desabilitado | RF-14/24 |

### F23 Relatórios
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0066 | + | Exportar CSV | Download `movimentacoes.csv` com cabeçalho "Data;Produto;Tipo;Quantidade;Unidade;Responsável;Motivo" | reports.jsx |
| CT_#0067 | − | Período sem perdas | Empresa isolada: "Nenhuma perda no período" / "Os registros aparecerão aqui." | reports.jsx |

### F24 Equipe
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0068 | + | Novo usuário (local) | Demonstração: toast "Usuário adicionado à demonstração."; linha na tabela | user-modal |
| CT_#0069 | − | Usuário sem nome/e-mail | Campos inválidos; sem toast; tabela inalterada | user-modal |
| CT_#0070 | + | Desativar usuário | Toast "Usuário desativado na demonstração."; badge "Desativado"; o próprio usuário só mostra "Seu usuário" | equipe |

### F25 Importação
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0071 | + | Importar nota de exemplo | Vincular os 3 itens; toast "3 itens adicionados ao estoque de demonstração."; vai para `#movimentacoes` | invoice-import |
| CT_#0072 | − | Item sem vínculo | "Confirmar entrada" desabilitado enquanto houver "1 item sem vínculo"; com sessão: "Importação ainda não disponível" | invoice-import |

### F26 Navegação
| CT | Tipo | Título | Esperado | Fonte |
|---|---|---|---|---|
| CT_#0073 | + | Itens do menu | Cada item da sidebar leva à rota e ao h1 corretos, com `aria-current=page` no ativo | NAV_ITEMS |
| CT_#0074 | − | `#produto` sem id em empresa nova | "Nenhum produto cadastrado" / "Cadastre o primeiro produto na tela de estoque." | produto.jsx |

Total: 74 CTs, todos os 26 fluxos com ≥1 positivo e ≥1 negativo. Único candidato a falhar como bug: CT_#0022 (`[bug_conhecido]`). Implementação inicial vai até o CT_#0056.

## 3. Destino dos testes antigos

| Antigo | Novo | Observação |
|---|---|---|
| local 0003 / prod 0021 | CT_#0003 | |
| local 0004 / prod 0022 | CT_#0004 | |
| local 0009 (senha errada) / prod 0020 | CT_#0002 / CT_#0005 | |
| local 0005 | CT_#0008 | |
| local 0008, 0009 (demo), prod 0014, 0015 | CT_#0019 / CT_#0020 | |
| local 0001, 0002 (menu) | CT_#0073 | |
| local 0006, prod 0023 | CT_#0015 | |
| local 0007, prod 0024 | CT_#0013 | |
| local 0010, prod 0026 | CT_#0016 | |
| local 0011, prod 0025 | CT_#0017 | |
| local 0012 | CT_#0018 | |
| prod 0013 | CT_#0021 | |
| prod 0016 | CT_#0046 | |
| prod 0017, 0018 | CT_#0009, CT_#0010 | |
| prod 0019 | CT_#0001 | |
| prod 0027, 0028 | CT_#0049, CT_#0050 | |
| prod 0029, 0030 | CT_#0041, CT_#0042 | |
| prod 0031..0037 | CT_#0027..0030, 0033..0035 | |
| prod 0038..0041 | CT_#0036..0039 | |
| prod 0042 | CT_#0047 | |
| prod 0043 | CT_#0053 | |
| prod 0044 | CT_#0055 / CT_#0056 | |
| `playwright.producao.config.js`, `env.producao.js`, `global-setup.producao.js`, `LoginProducaoFlows`, `SessaoProducaoPage` | **descartados** | A regra proíbe apontar para produção. A cobertura equivalente roda local. |

Nada da cobertura atual se perde. A única diferença é que ela deixa de rodar contra o Render.

## 4. Estrutura de arquivos (em `e2e/`)

```
_backup_testes_antigos/
config/            env.js, local.env.json, usuarios.js
global/            global-setup.js
fixtures/          usuario_autenticado.fixture.js, nao_autenticado.fixture.js, dadosBasicos.json, imagem-valida.png, arquivo-invalido.txt
support/locators/  comunsLocators.js, loginLocators.js, logoutLocators.js,
                   modulo_ISTOQUE/{cadastroEmpresa,recuperarAcesso,landing,naoEncontrada,painel,alertas,estoque,produtoModal,detalheProduto,reposicao,movimentacao,receita,producao,relatorio,equipe,importacao}Locators.js
support/pages/     HelpersPage.js, ComunsPage.js, LoginPage.js, LogoutPage.js, modulo_ISTOQUE/{Tela}Page.js (um por locator acima)
support/flows/     LoginFlows.js, ComunsFlows.js, EmpresaFlows.js, ProdutoFlows.js
e2e/modulo_ISTOQUE/{cadastro_empresa,sessao,demonstracao,landing,pagina_404,recuperar_acesso,produto_cadastro,produto_edicao,categoria,unidades_medida,estoque,produto_detalhe,produto_desativado,painel,alertas,reposicao,telas_locais,movimentacao,receitas,producao,relatorios,equipe,importacao,navegacao}/testes_{sucesso|negativo}_*.spec.js
e2e/modulo_ISTOQUE/z_login/   e   z_logout/
e2e/z_clean_up/limpar_ambiente_massa_testes.spec.js
playwright.config.js, eslint.config.js, package.json, .gitignore (storageState-*.json, relatórios, test-results)
```

Observações de implementação:
- `HelpersPage` só tem o genérico: esperas condicionais (visível, URL, resposta de rede, `networkidle` só quando indispensável), leitura/gravação de `localStorage`, contagem de chamadas à API, mocks com `page.route` e geração de código único. Nada de `waitForTimeout` e nenhuma regra de negócio.
- As chamadas de negócio à API (criar empresa/usuário/produto, listar, desativar) ficam em `EmpresaFlows` e `ProdutoFlows`, usando `page.request`.
- `EmpresaFlows.criarEmpresaIsolada()` cria empresa+admin pela API e injeta a sessão no `localStorage` por método genérico do `HelpersPage` (a UI não faz login nesse caso). Os specs de login/cadastro usam o `nao_autenticado.fixture`.
- Os arquivos de locators e de Pages dos fluxos de modal (produto, movimentação, receita, produção, usuário) serão separados por tela, e o que for usado em mais de um arquivo (menu, toast, modal genérico, botão por nome) vai para `comunsLocators.js`.

## 5. Papéis e usuários

| Papel | Perfil no sistema | Uso |
|---|---|---|
| `administrador` | Administrador (criado no cadastro da empresa) | quase todos os CTs |
| `gerente` | Gerente | CT_#0006 |
| `funcionario` | Funcionário | CT_#0006 |

- `global-setup.js` cria **uma empresa de suíte** via `POST /api/auth/cadastro` (CNPJ e e-mail únicos com carimbo de data/hora, prefixo `E2E`), lê `GET /api/perfis` e cria o Gerente e o Funcionário via `POST /api/usuarios` com o token do administrador. Faz login pela UI de cada um e grava `storageState-istoque-{papel}.json` (a sessão fica no `localStorage`, que o `storageState` do Playwright preserva).
- Em `main` o servidor trata Gerente e Funcionário igual; por isso eles só têm o CT de login com perfil. Quando a HU007 chegar, o plano ganha CTs de permissão (hoje seriam asserções sobre comportamento que não existe).
- Não há seed de usuários; as senhas de teste ficam em `config/usuarios.js` (arquivo ignorado pelo git), nunca em `dadosBasicos.json`.

## 6. Massa de dados e limpeza

- Todo dado criado tem **código único** `E2E{AAAAMMDDHHmmss}{seq}` (função em `HelpersPage`) usado em nome de produto, categoria, razão social e e-mail (`e2e.{codigo}@exemplo.com`). CNPJ único gerado com 14 caracteres alfanuméricos válidos pela regex (o back não valida dígito verificador).
- Cada teste guarda o que criou em `testInfo['massaProduto']` (objeto único, p.ex. `{ ids, nomes }`) e o `afterEach` **desativa os produtos via `PATCH /api/produtos/{id}/desativar`** (a UI não tem como). Empresas isoladas dos CTs 0001–0012, 0043, 0048, 0052, 0054, 0058, 0067, 0074 também ficam registradas em `testInfo` para a limpeza final.
- **Não há como apagar pela UI nem pela API**: categorias, usuários, empresas e produtos desativados permanecem (não existe `DELETE`). **Decidido**: `z_clean_up` desativa via API o que for possível e confere que `GET /api/produtos/ativos` de cada empresa E2E (suíte e isoladas, lidas de `.massa-e2e.json`) está vazio. Sem reset de branch e sem SQL na suíte; o reset da branch `e2e-teste` é manual, feito por você.

## 7. Chaves previstas de `dadosBasicos.json`

- `botao`: entrar, criarConta, sair, novoProduto, salvarProduto, cancelar, tentarDeNovo, limparFiltros, simularRecuperacao, voltar, novaReceita, salvarFichaTecnica, registrarProducao, confirmarProducao, concluir, confirmarMovimentacao, novoUsuario, adicionarUsuario, desativar, reativar, exportarCsv, exportarLista, usarNotaExemplo, confirmarEntrada, reiniciarDemonstracao, voltarVisaoGeral, irParaEstoque, adicionarFoto, substituirFoto, removerFoto, mostrarSenha, ocultarSenha, criarContaEmpresa.
- `campo`: emailUsuario, senha, razaoSocial, cnpj, nomeResponsavel, confirmarSenha, nomeProduto, tipo, categoria, novaCategoria, unidadeControle, estoqueMinimo, estoqueMaximo, controlaValidade, buscarIngrediente, nomeReceita, tempoPreparo, ingrediente, quantidade, motivo, nomeCompleto, perfil.
- `mensagem`: loginInvalido, sessaoExpirada, informeEmail, informeSenha, informeRazaoSocial, informeCnpj, informeNome, confirmeSenha, emailInvalido, cnpjFormato, senhaMinima, senhasDiferentes, cnpjDuplicado, emailDuplicado, produtoCadastrado, produtoAtualizado, estoqueMaximoMenor, violacaoIntegridade, formatoImagem, imagemGrande, produtoNaoEncontrado, produtoNaoEncontradoDica, nenhumResultado, nenhumResultadoDica, nenhumProduto, nenhumProdutoDica, erroCarregarDados, apiNaoRespondeu, estoqueAbastecido, estoqueAbastecidoDica, telaLocal, movimentacaoDemo, movimentacaoLocal, quantidadeSuperaSaldo, fichaSalva, ingredienteRepetido, producaoRegistrada, estoqueInsuficiente, usuarioAdicionado, usuarioDesativado, demonstracaoReiniciada, simulacaoRecuperacao, importacaoNota, importacaoIndisponivel, nenhumaPerda, nenhumaPerdaDica, erro404Titulo, erro404Etiqueta.
- `menu`: visaoGeral, estoque, movimentacoes, receitas, reposicao, relatorios, equipe.
- `rota`: login, cadastro, recuperar, dashboard, estoque, produto, receitas, receita, reposicao, relatorios, equipe, movimentacoes, importacao, fluxos, inicio.
- `titulo`: login, cadastro, painel, estoque, detalheProduto, reposicao, relatorios, equipe, receitas, fichaTecnica, movimentacoes, novoProduto, editarProduto, recuperarAcesso, alertas, landingHero.
- `rotulo`: seloConectado, seloDemonstracao, rodapeDemonstracao, rodapeServidor, perfilAdministrador, perfilGerente, perfilFuncionario, tipoInsumo, tipoRevenda, tipoAmbos, semCategoria, novaCategoria, badgeSemEstoque, badgeEstoqueBaixo, badgeEmDia.
- `produto_demo`: nomes fixos da demonstração (Tomate italiano, Hambúrguer da casa, ids `tomate`, `burger`).

## 8. Divergências, lacunas e dúvidas

**Código × documentação**
1. README e `02-Especificação` dizem que receitas são só em memória e que a proteção de rotas "está em desenvolvimento". No back, receitas têm API completa e o JWT protege `/api/**`; no **front**, receitas continuam só locais e rotas internas **não são protegidas** (abrem em demonstração).
2. HU003 e HU009 / RF-37 pedem reativar usuário/produto, e HU009 pede desativar pelo Gerente: o back só desativa produto (sem reativar) e o front não tem nenhuma das duas ações.
3. RE-03/RF-06 e a matriz da doc `08` (Funcionário sem `produtos.gerenciar` etc.) não valem em `main`: Gerente e Funcionário podem tudo que não é rota de administrador (até `GET /api/usuarios`). Está na branch HU007.
4. RE-07: saldo de produto em `un` aceita fração (só itens de receita validam).
5. `06` cita CRUD global de empresas e `GET /categorias?empresaId=`; o código tem só `/api/empresas/minha` e ignora o parâmetro.
6. Limites diferentes para o mesmo campo (razão social 150 no cadastro × 255 na atualização; e-mail de usuário sem `@Size`).
7. Datas: receitas em ISO com fuso; demais em `yyyy-MM-dd HH:mm:ss`. `Location` de receita é absoluto.
8. Contagem de 214 testes do back na wiki: não verificada.

**Possíveis bugs / comportamentos suspeitos**
- Duplicidade de produto/categoria devolve **409 genérico** ("A operação viola uma restrição de integridade dos dados"), sem dizer o campo; a comparação é sensível a maiúsculas e sem trim. Os CTs 0030, 0035 e 0038 **não fixam o texto**: validam que um erro aparece e que nada foi gravado. A mensagem genérica vai para o relatório final como melhoria.
- FAQ da landing exibe 3 textos-modelo entre colchetes (CT_#0022, tag `[bug_conhecido]`, falha hoje).
- O modal de alertas não tem mensagem de vazio (lacuna de UX, sem CT); o CT_#0052 cobre a ausência do ponto indicador.
- Sem bloqueio por tentativas de login; token não é revogado após troca de senha; empresa inativa não impede login; `Content-Type` não JSON e itens `null` em receita provavelmente dão 500; senha >72 bytes pode dar 500. São achados de **API**, fora da UI; ficam registrados e entram no relatório final, não em CTs.
- Dependência no banco: os testes do back usam H2 sem Flyway; as constraints só são exercitadas em Postgres real (a branch Neon cobre).
- `back-e2e.jar` (62 MB) e relatórios antigos estão em `e2e/`; vão para o backup ou saem da pasta.
- `.gitignore` da raiz está **modificado e não commitado** (`M .gitignore`) e é a única barreira que mantém `e2e/` fora do git; o `package.json` antigo diz que a regra estaria em `.git/info/exclude`, mas esse arquivo não tem a regra. Sugiro colocar a regra também em `.git/info/exclude` (local, não versionado). Não vou fazer commit/push/PR. O `application.properties` versionado contém a senha do Neon de dev e a chave JWT padrão (fora do meu escopo, mas vale avisar a equipe).

**Elementos sem locator estável (sugestões, sem mexer no front)**: campos do modal de movimentação (sem `name`/`id`), inputs de texto do modal de produto (sem `id`/`name`, só `label>span`), linhas de tabela sem identificador, toast sem `data-*`, `href` repetidos na sidebar e no menu mobile (`nav.mobile-nav` é `display:none` no desktop). Sugestões: `data-testid` em formulários/modais/toast/linhas.

**Lacunas de UX / melhorias a relatar**: sem mensagem de vazio no modal de alertas; mensagem genérica de 409 para produto/categoria duplicados; sem guarda de rota (padrão GAC espera permanecer no login após logout); FAQ com texto-modelo.

**Pendências**: o projeto modelo `orangeHRM-e2e-playwright_teste` está em `e2e/docs-referencia-e2e/`; leio antes de escrever HelpersPage, fixtures e specs e uso como referência de estilo. A branch Neon `e2e-teste` só será criada com sua confirmação.

## 9. Ordem de implementação

0. Backup para `_backup_testes_antigos/` (inclui `back-e2e.jar`, relatórios e configs de produção); regra `e2e/` em `.git/info/exclude`; `package.json` (Playwright 1.64.1 mantido, cross-env, ESLint), `.gitignore`, `playwright.config.js` (projetos papel-navegador; Chromium e `workers=1` no dia a dia).
1. Base: `config/`, `HelpersPage`, `ComunsPage`, fixtures, `dadosBasicos.json` inicial, `global-setup`.
2. **Confirmar com você e criar a branch Neon `e2e-teste`**; back local apontando para ela (manual: `./mvnw spring-boot:run` com as variáveis; `global-setup` falha com mensagem clara se `/actuator/health` não responder).
3. `z_login` (0001–0007), `cadastro_empresa` (0008–0012), `z_logout` (0013–0014).
4. Sessão (0015–0018), demonstração/landing/404/recuperar (0019–0026).
5. Produto: cadastro, edição, categoria, unidades (0027–0040), estoque, detalhe, desativado (0041–0048).
6. Painel, alertas, reposição, telas locais (0049–0056).
7. `z_clean_up`; verificação final restrita aos CTs 0001–0056.
8. **PARADA para sua revisão.** Só depois entram os CTs 0057–0074 (movimentação, receitas, produção, relatórios, equipe, importação, navegação).
Cada fluxo termina com uma linha: fluxo, CTs, status. Testes antigos são removidos quando seus substitutos passarem (os de movimentação/receitas/etc. não existiam antes, então nada antigo depende deles).

## Verificação final
1. `npx eslint .` sem erros.
2. Suíte (CTs 0001–0056) em Chromium, `--workers=1`, **duas execuções seguidas** com resultado idêntico; as únicas falhas aceitas são as dos CTs com tag `[bug_conhecido]` (hoje o CT_#0022); sem `waitForTimeout`.
3. `z_clean_up` e conferência de que não restaram produtos ativos nas empresas E2E.
4. Relatório curto: tabela fluxo × CTs (+/−) × status, bugs (ação, observado, esperado, evidência), testes antigos removidos e pendências. Outros navegadores só rodam se você pedir.
