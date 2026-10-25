# Metodologia

Esta seção descreve a organização da equipe, o acompanhamento das tarefas e as ferramentas utilizadas no desenvolvimento do IS.TOQUE. As práticas apresentadas consideram os artefatos e registros disponíveis no repositório, como histórias de usuários, tarefas técnicas, branches, pull requests, documentação e verificações automatizadas.

## Gerenciamento de Projeto

O projeto adota o Scrum como referência para o planejamento incremental e a organização das responsabilidades, conforme o [Guia do Scrum, de Schwaber e Sutherland (2020)](https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-PortugueseBR-3.0.pdf). O acompanhamento visual das atividades é organizado por meio do GitHub Projects e das tarefas vinculadas ao repositório.

Na aplicação ao trabalho acadêmico, o planejamento deve considerar as prioridades dos requisitos, as dependências técnicas e as entregas previstas pela disciplina. As funcionalidades são decompostas em tarefas, implementadas e verificadas de forma incremental, permitindo incorporar correções e orientações recebidas durante o acompanhamento do projeto.

O registro atual apresenta tarefas com critérios de aceite, responsáveis e dependências, além de contribuições integradas por pull requests. Os responsáveis definidos pela equipe são David William da Silva Rocha como Product Owner e Eduardo Rezende Machado como Scrum Master. A duração das Sprints e o calendário dos eventos Scrum ainda precisam ser formalizados nesta documentação.

### Divisão de Papéis

A equipe de desenvolvimento é composta por Amauri Luca Martinez Azevedo, Andreik Fernandes Rocha, David William da Silva Rocha e Eduardo Rezende Machado. A orientação acadêmica é realizada pelo professor Paulo Henrique Rodrigues.

Os papéis e as frentes de atuação são descritos da seguinte forma:

- **Scrum Master — Eduardo Rezende Machado:** apoia a organização do processo, o acompanhamento das tarefas e o tratamento de impedimentos, ajudando a equipe a revisar suas práticas.
- **Product Owner — David William da Silva Rocha:** representa as necessidades do produto, comunica os objetivos do IS.TOQUE e ordena o backlog conforme o valor das funcionalidades e as prioridades acordadas com a equipe.
- **Equipe de Desenvolvimento:** os quatro integrantes participam da implementação, dos testes e da documentação, conforme as tarefas atribuídas no repositório.
- **Equipe de Design:** a frente de identidade visual e padronização das telas possui atividade atribuída a David William da Silva Rocha, conforme a [HT033](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/62). As implementações de interface também recebem contribuições registradas nos pull requests do projeto.

A distribuição abaixo foi levantada a partir dos responsáveis registrados nas issues em 23/10/2026. As frentes descritas contemplam atividades abertas e contribuições já encerradas; o estado de cada item deve ser consultado na respectiva tarefa.

| Integrante | Atividades atribuídas no repositório |
| --- | --- |
| Amauri Luca Martinez Azevedo | Gestão de usuários e senha, receitas, capacidade de produção, histórico, alertas, relatórios e reposição, com tarefas de backend e frontend. Exemplos: [HU015 — ficha técnica](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/68), [HU016 — capacidade](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/75) e [HT031 — integração contínua](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/61). |
| Andreik Fernandes Rocha | Autenticação e isolamento no backend, movimentações, ajustes, produção e fotos de produtos. Exemplos: [HT001 — autenticação](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/15), [HU008 — entrada](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/67), [HU010 — saída](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/74) e [HU017 — produção](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/77). |
| David William da Silva Rocha | Product Owner e frente de identidade visual; tarefas de frontend relacionadas a isolamento, permissões, usuários, fichas técnicas, capacidade, histórico, alertas e fotos. Exemplos: [HT033 — identidade visual](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/62), [HU003 — usuários](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/89) e [HU015 — receitas](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/76). |
| Eduardo Rezende Machado | Scrum Master; tarefas de banco de dados, permissões, infraestrutura, acesso à API e interfaces de movimentação, ajuste e produção. Exemplos: [HT035 — esquema do banco](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/63), [HU007 — permissões](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/73), [HT034 — publicação](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/64) e [HU008 — entrada no frontend](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/80). |

As responsabilidades são acompanhadas por tarefa, permitindo colaboração entre as frentes de interface, backend, banco de dados, testes e documentação.

### Processo

O acompanhamento do desenvolvimento utiliza o [quadro do projeto no GitHub Projects](https://github.com/orgs/ICEI-PUC-Minas-PBR-ADS/projects/170) e as [tarefas do repositório](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues). As histórias de usuários são identificadas por **HU**, as tarefas técnicas por **HT** e os requisitos por **RF**, **RNF** e **RE**, conforme a [Especificação do Projeto](02-Especificação%20do%20Projeto.md).

Cada tarefa deve apresentar a necessidade atendida, os critérios de aceite, o responsável e as dependências que condicionam sua execução. Quando uma funcionalidade envolve interface e API, o trabalho pode ser dividido em tarefas de frontend e backend, mantendo a identificação da história correspondente.

O fluxo de acompanhamento previsto no template da disciplina é utilizado como referência:

| Etapa | Finalidade e condição de movimentação |
| --- | --- |
| **Backlog** | Reunir necessidades, correções e melhorias identificadas para o produto. |
| **To Do** | Selecionar as tarefas da etapa ou do ciclo de trabalho, com responsável, critérios de aceite e dependências identificados. |
| **In Progress** | Acompanhar tarefas cuja implementação foi iniciada, registrando o progresso e os impedimentos. |
| **Ready to Test** | Sinalizar que os artefatos estão disponíveis para revisão e validação, com indicação do código e das instruções de teste. |
| **Testing** | Executar a revisão do código e os testes aplicáveis, registrando os resultados e os ajustes necessários. |
| **Done** | Identificar entregas cujos critérios foram atendidos, verificações foram concluídas e artefatos foram integrados à versão de referência. |

O levantamento das issues do repositório em **23/10/2026** identificou **77 registros: 38 abertos e 39 fechados**. O resumo considera o estado das issues; as colunas específicas do Projects devem ser conferidas no quadro.

| Responsável registrado | Issues abertas | Issues fechadas | Consulta das atividades abertas |
| --- | --- | --- | --- |
| Amauri Luca Martinez Azevedo | 14 | 4 | [Tarefas de Amauri](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues?q=is%3Aissue%20is%3Aopen%20assignee%3AAmauriMartinez) |
| Andreik Fernandes Rocha | 7 | 2 | [Tarefas de Andreik](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues?q=is%3Aissue%20is%3Aopen%20assignee%3AAndreik-f) |
| David William da Silva Rocha | 8 | 1 | [Tarefas de David](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues?q=is%3Aissue%20is%3Aopen%20assignee%3Adavidwsr1) |
| Eduardo Rezende Machado | 9 | 30 | [Tarefas de Eduardo](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues?q=is%3Aissue%20is%3Aopen%20assignee%3Aerezende544) |
| Sem responsável atribuído | 0 | 2 | Registros fechados sem atribuição nominal. |

As tarefas apresentam dependências que orientam a sequência de execução. A autenticação e o isolamento da empresa sustentam as operações protegidas; a preparação do banco atende às funcionalidades de estoque, receitas e fotos. O registro de produção depende das saídas de estoque, da composição da receita e do cálculo de capacidade. Essas relações estão explicitadas, por exemplo, na [HU008 — entrada](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/67), na [HU015 — ficha técnica](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/68) e na [HU017 — produção](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/77).

A situação corrente dos itens deve ser consultada diretamente no quadro. A captura do Kanban atual ainda não está armazenada no repositório; seu registro visual permanece pendente para complementar esta seção.

O desenvolvimento de uma entrega segue estas atividades:

1. **Planejamento:** selecionar os itens a partir da prioridade, das dependências e da capacidade de execução da equipe.
2. **Implementação:** desenvolver a funcionalidade na branch de trabalho, mantendo a tarefa atualizada e relacionando os commits à entrega.
3. **Revisão:** disponibilizar as mudanças por pull request quando houver integração de código, descrevendo o comportamento e as verificações realizadas.
4. **Validação:** conferir os critérios de aceite, executar os testes aplicáveis e registrar correções ou limitações encontradas.
5. **Integração e acompanhamento:** integrar a entrega à `main`, atualizar a documentação relacionada e revisar o planejamento a partir dos resultados e das orientações acadêmicas.

A validação combina verificações automáticas e conferência manual dos fluxos. O [workflow de integração contínua](../.github/workflows/ci.yml) está configurado para executar testes do backend em Java 21 e testes e build do frontend em Node.js 24, nos pull requests destinados à `main` e nos pushes nessa branch. O resultado de cada execução fica disponível no [GitHub Actions](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/actions).

Os testes de integração do backend utilizam H2 em memória. Alterações no esquema PostgreSQL devem ser verificadas também por meio das migrações e da validação das entidades, conforme o [README do backend](../codigo-fonte/Backend/istoque/README.md).

O [relatório de contribuições](../documentos/CONTRIBUTION_REPORT.md), gerado por GitHub Actions, complementa o acompanhamento da autoria e da evolução dos arquivos. Sua análise deve considerar os artefatos entregues, as tarefas e as revisões registradas.

### Etiquetas

As etiquetas identificam as frentes envolvidas em cada tarefa e auxiliam na seleção e distribuição das atividades. As etiquetas verificadas nas 77 issues consultadas são:

| Etiqueta | Cor registrada | Aplicação |
| --- | --- | --- |
| **Backend** | `#C3FB86` | Regras de negócio, serviços, endpoints e testes da API. |
| **Frontend** | `#B5B3FC` | Telas, componentes, navegação e integração da interface com a API. |
| **Banco de dados** | `#F2FA6F` | Modelagem, migrações e regras de integridade do banco. |
| **Bug** | `#D73A4A` | Correções de comportamentos incorretos identificados no sistema. |
| **documentation** | `#0075CA` | Produção e atualização dos materiais de documentação. |

Uma tarefa pode receber mais de uma etiqueta quando envolver diferentes frentes, como ocorre na integração contínua e nas permissões associadas ao banco de dados. A conclusão da atividade é acompanhada pelo seu estado no fluxo de trabalho e pelos critérios de aceite.

### Ferramentas

Os ambientes e ferramentas identificados no projeto estão relacionados abaixo.

| AMBIENTE | PLATAFORMA | LINK DE ACESSO |
| --- | --- | --- |
| Repositório de código fonte | Git e GitHub | [Repositório do IS.TOQUE](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1) |
| Documentos do projeto | Markdown e imagens versionados no GitHub | [Documentação](./) |
| Projeto de Interface | Figma e documentação de UX | [Protótipo no Figma](https://www.figma.com/design/lzqDPhDmWXvfqF5hGT7hQv/ISTOQUE-%E2%80%94-Prot%C3%B3tipo-de-alta-fidelidade?node-id=8-2) e [fluxos e interfaces](ux/fluxos-e-interfaces.md) |
| Gerenciamento do Projeto | GitHub Projects e GitHub Issues | [Quadro do projeto](https://github.com/orgs/ICEI-PUC-Minas-PBR-ADS/projects/170) e [tarefas](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues) |
| Testes e integração contínua | GitHub Actions | [Execuções dos workflows](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/actions) |
| Documentação da API | Wiki do GitHub (endpoints com corpos de requisição e resposta, erros, execução e testes) e tabela de endpoints no README do backend | [Wiki do projeto](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/wiki) e [README do backend](../codigo-fonte/Backend/istoque/README.md) |
| Hospedagem do frontend | Render (site estático) | [Frontend em produção](https://istoque-front.onrender.com) |
| Hospedagem da API | Render (Docker) | [API de produção](https://is-toque-prod.onrender.com) |
| Banco de dados | PostgreSQL no Neon e H2 para testes | [Configuração e migrações](../codigo-fonte/Backend/istoque/README.md) |
| Desenvolvimento do backend | Java 21, Spring Boot e Maven Wrapper | [Instruções do backend](../codigo-fonte/Backend/istoque/README.md) |
| Desenvolvimento do frontend | React, Vite e Node.js | [Instruções do frontend](../codigo-fonte/Frontend/istoque/README.md) |

O frontend está publicado em [https://istoque-front.onrender.com](https://istoque-front.onrender.com) e a API em [https://is-toque-prod.onrender.com](https://is-toque-prod.onrender.com). O deploy é automático a partir do repositório `erezende544/is.toque_prod`, branch `Release`: o frontend como site estático e o backend em Docker. A manutenção do ambiente de produção é acompanhada na [HT034](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/64).

### Estratégia de Organização de Codificação

Os artefatos de implementação ficam na pasta [`codigo-fonte`](../codigo-fonte), com separação entre frontend e backend. A organização interna acompanha as responsabilidades dos componentes e das funcionalidades.

| Local | Conteúdo |
| --- | --- |
| `codigo-fonte/Backend/istoque` | Aplicação Java com Spring Boot, dependências Maven e testes. |
| `codigo-fonte/Frontend/istoque` | Aplicação React com Vite, componentes, estilos e testes. |
| `documentação/` | Contexto, requisitos, metodologia, interfaces, arquitetura e materiais de UX. |
| `documentos/` | Relatório de contribuições e gráficos de acompanhamento. |
| `.github/workflows/` | Integração contínua e geração do relatório de contribuições. |

No backend, o código está organizado em camadas:

| Pasta em `codigo-fonte/Backend/istoque/src/` | Responsabilidade |
| --- | --- |
| `main/java/br/com/istoque/controller/` | Receber as requisições e encaminhá-las aos serviços. |
| `main/java/br/com/istoque/services/` | Implementar as regras de negócio e coordenar as operações. |
| `main/java/br/com/istoque/dto/` | Definir os dados de entrada e saída da API. |
| `main/java/br/com/istoque/infrastructure/` | Organizar entidades e repositórios de acesso aos dados. |
| `main/java/br/com/istoque/config/` e `main/java/br/com/istoque/exception/` | Configurações da aplicação e tratamento dos erros. |
| `main/resources/db/migration/` | Scripts SQL versionados pelo Flyway. |
| `test/` | Testes e configurações do banco em memória. |

No frontend, a organização é por funcionalidades:

| Pasta em `codigo-fonte/Frontend/istoque/src/` | Responsabilidade |
| --- | --- |
| `app/` | Rotas, composição das telas, providers e carregamento dos dados da empresa. |
| `features/` | Autenticação, produtos, estoque, receitas, produção, usuários, relatórios e importação demonstrativa. |
| `components/` | Componentes de interface e layouts compartilhados. |
| `lib/` | Cliente HTTP utilizado na comunicação com a API. |
| `stores/` | Estado da sessão, dos dados das telas e da interface. |
| `utils/` | Cálculos de estoque, filtros, exportação CSV e formatação. |
| `styles/` | Estilos de base, layout, componentes e funcionalidades. |
| `testing/mocks/` | Dados fictícios utilizados na demonstração. |

O histórico registra branches pessoais e branches por entrega, como `andreik`, `eduardo` e `feat-hu020-trocar-senha-propria`. A `main` reúne a versão integrada do projeto. Nos pull requests, a descrição deve indicar a tarefa atendida, as alterações realizadas e as verificações executadas.

As mensagens de commit devem comunicar a finalidade da mudança; os prefixos `feat`, `fix` e `docs` podem ser utilizados para funcionalidades, correções e documentação. Mudanças no banco devem incluir uma nova migração e as alterações correspondentes no código. Os procedimentos de execução e integração estão detalhados nos READMEs de cada aplicação.
