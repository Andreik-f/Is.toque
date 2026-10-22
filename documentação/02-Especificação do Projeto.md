# Especificação do Projeto

## Visão Geral da Solução

O IS.TOQUE tem como finalidade apoiar restaurantes e pequenos negócios no controle interno de produtos, insumos e produção. A solução reúne cadastros, movimentações de estoque, receitas, alertas e informações históricas, permitindo relacionar a disponibilidade dos ingredientes à capacidade de preparar cada receita.

O cadastro inicial deverá reunir os dados da empresa e de seu administrador em uma mesma operação. O acesso será realizado por e-mail e senha, e cada usuário ficará vinculado a uma empresa. As consultas e alterações deverão respeitar esse vínculo e as permissões do perfil, com os perfis padrão Administrador, Gerente e Funcionário.

Os produtos deverão possuir nome, tipo, unidade de medida, saldo e níveis de estoque. A categoria, o estoque máximo e a foto serão opcionais. Quando houver controle de validade, as entradas deverão formar lotes, permitindo acompanhar vencimentos e priorizar a utilização dos lotes que vencem primeiro. Entradas, saídas, perdas, descartes e ajustes deverão atualizar o saldo e gerar registros com data, motivo e responsável.

As receitas funcionarão como fichas técnicas que relacionam produtos e quantidades de consumo por unidade produzida. Sua criação e edição deverão preservar o estoque. Ao registrar uma produção, o sistema deverá conferir a capacidade disponível, calcular o consumo de todos os ingredientes e efetuar as respectivas baixas em uma única operação. A capacidade de produção será determinada pelo ingrediente com menor disponibilidade proporcional à quantidade exigida pela receita.

O acompanhamento do estoque deverá incluir alertas de quantidade e validade, lista de reposição, histórico e relatórios por período. Os requisitos desta página descrevem o comportamento esperado da solução e orientam sua evolução.

Na implementação atual, o cadastro de empresa e administrador, o login e os cadastros e consultas de produtos e categorias estão integrados à API, assim como a consulta de unidades de medida. Movimentações, receitas, produção, relatórios, equipe e fotos ainda possuem operações locais na interface; a importação de notas fiscais é demonstrativa. A proteção das rotas por token e permissões e o isolamento entre empresas no servidor permanecem em desenvolvimento. Os detalhes de execução e integração estão no [README do frontend](../codigo-fonte/Frontend/istoque/README.md).

## Perfis de Usuários

<table>
<tbody>
<tr align="center">
<th colspan="2">Administrador</th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Usuário responsável pela configuração da empresa, criado no cadastro inicial. O perfil padrão possui todas as permissões do sistema.</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Manter os dados da própria empresa; gerenciar usuários, perfis e permissões; acompanhar e operar produtos, estoque, receitas, produção e relatórios.</td>
</tr>
</tbody>
</table>

<table>
<tbody>
<tr align="center">
<th colspan="2">Gerente</th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Usuário responsável pelo acompanhamento do estoque e da produção. O perfil padrão permite gerenciar produtos e receitas, movimentar e ajustar estoque, registrar produção e consultar relatórios.</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Consultar saldos, alertas, histórico e capacidade das receitas; manter produtos e fichas técnicas; registrar correções justificadas e planejar reposições.</td>
</tr>
</tbody>
</table>

<table>
<tbody>
<tr align="center">
<th colspan="2">Funcionário</th>
</tr>
<tr>
<td width="150px"><b>Descrição</b></td>
<td width="600px">Usuário responsável pelas atividades operacionais. O perfil padrão permite movimentar estoque e registrar produção, além das consultas operacionais previstas para usuários autenticados.</td>
</tr>
<tr>
<td><b>Necessidades</b></td>
<td>Consultar produtos, receitas, capacidade e histórico; registrar entradas, saídas, perdas, descartes e produções conforme as permissões atribuídas.</td>
</tr>
</tbody>
</table>

Proprietário é uma função no estabelecimento; seu acesso no sistema dependerá do perfil atribuído. As permissões padrão poderão ser ajustadas pelo administrador, respeitando as restrições desta especificação. O catálogo de permissões e a matriz inicial estão descritos na [Arquitetura da Solução](08-Arquitetura%20da%20Solução.md).

## Histórias de Usuários

As histórias HU001 a HU020 mantêm a identificação utilizada nas tarefas do repositório. Cada linha relaciona a necessidade do usuário aos requisitos funcionais que a detalham.

| EU COMO... `QUEM` | QUERO/PRECISO ... `O QUE` | PARA ... `PORQUE` |
| --- | --- | --- |
| **HU001** — responsável por cadastrar uma empresa | criar a empresa e seu administrador em uma mesma etapa. **Requisitos:** RF-01, RF-02. | iniciar a configuração do meu estabelecimento. |
| **HU002** — usuário cadastrado | entrar com meu e-mail e minha senha. **Requisitos:** RF-03, RF-06. | acessar os dados e recursos autorizados da minha empresa. |
| **HU003** — administrador | cadastrar, consultar, editar, desativar e reativar usuários da minha empresa. **Requisitos:** RF-04. | organizar quem pode utilizar o sistema. |
| **HU004** — administrador | atribuir um perfil a cada usuário. **Requisitos:** RF-05, RF-06. | adequar o acesso às responsabilidades de cada pessoa. |
| **HU005** — responsável pelo estoque | cadastrar e editar produtos com categoria, unidade de medida e níveis de estoque. **Requisitos:** RF-07, RF-08, RF-09, RF-10, RF-19, RF-36. | manter os insumos organizados e consultar sua disponibilidade. |
| **HU006** — administrador | consultar e atualizar os dados e as configurações da minha empresa. **Requisitos:** RF-35. | manter as informações do estabelecimento e seus alertas atualizados. |
| **HU007** — administrador | definir as permissões dos perfis da minha empresa. **Requisitos:** RF-05, RF-06. | controlar quais operações cada perfil pode executar. |
| **HU008** — funcionário responsável pelo estoque | registrar entradas com quantidade e, quando aplicável, validade do lote. **Requisitos:** RF-11, RF-13, RF-15, RF-30, RF-31. | atualizar o saldo e acompanhar os produtos recebidos. |
| **HU009** — gerente | desativar e reativar produtos. **Requisitos:** RF-37. | organizar os itens em uso e preservar os registros anteriores. |
| **HU010** — funcionário responsável pelo estoque | registrar saídas, perdas e descartes com os respectivos motivos. **Requisitos:** RF-12, RF-13, RF-14, RF-18, RF-31. | refletir o consumo real e acompanhar as perdas. |
| **HU011** — gerente | ajustar o saldo conforme a contagem física e informar uma justificativa. **Requisitos:** RF-16, RF-15, RF-31. | corrigir divergências mantendo o histórico da correção. |
| **HU012** — usuário da empresa | consultar o histórico com filtros por produto, operação e período. **Requisitos:** RF-15, RF-31, RF-32. | identificar o que foi movimentado, quando e por quem. |
| **HU013** — gerente | visualizar o resumo do estoque e os alertas de quantidade e validade. **Requisitos:** RF-17, RF-19, RF-30. | priorizar reposições e acompanhar os lotes que exigem atenção. |
| **HU014** — gerente | consultar a lista de reposição e as quantidades sugeridas para compra. **Requisitos:** RF-17, RF-33. | planejar o abastecimento dos produtos em falta ou no mínimo. |
| **HU015** — gerente da cozinha | cadastrar, consultar e editar fichas técnicas com os ingredientes e as quantidades por unidade produzida, além de desativar receitas. **Requisitos:** RF-20, RF-21, RF-38. | padronizar a composição utilizada no cálculo de consumo. |
| **HU016** — gerente da cozinha | consultar a capacidade atual das receitas e seus ingredientes limitantes. **Requisitos:** RF-22, RF-23, RF-29. | decidir o que produzir e o que precisa ser reposto. |
| **HU017** — funcionário responsável pela produção | registrar quantas unidades de uma receita foram produzidas. **Requisitos:** RF-24, RF-25, RF-26, RF-27, RF-28, RF-29, RF-31. | calcular e baixar os ingredientes utilizados e conhecer a capacidade restante. |
| **HU018** — responsável pelo cadastro de produtos | adicionar, trocar ou remover uma foto do produto. **Requisitos:** RF-34. | facilitar a identificação visual dos insumos. |
| **HU019** — proprietário ou gerente com acesso a relatórios | consultar um resumo das movimentações, perdas e produções em um período. **Requisitos:** RF-18, RF-32, RF-33. | acompanhar o consumo e apoiar o planejamento do estabelecimento. |
| **HU020** — usuário autenticado | alterar minha própria senha informando a senha atual. **Requisitos:** RF-39. | manter minhas credenciais atualizadas. |

## Requisitos do Projeto

Os requisitos foram organizados a partir das histórias de usuários e das regras de estoque, receitas e produção. Os identificadores RF-01 a RF-33 foram preservados para manter as referências existentes. O RF-34 incorpora a foto opcional já prevista na documentação de UX; os RF-35 a RF-39 explicitam comportamentos descritos nas tarefas e nos fluxos atuais.

As prioridades orientam a implementação: **Alta** para operações essenciais e integridade dos dados; **Média** para recursos de organização e acompanhamento que complementam o fluxo principal; e **Baixa** para melhorias posteriores.

### Requisitos Funcionais

| ID | Descrição | Prioridade |
| --- | --- | --- |
| RF-01 | O sistema deverá permitir o cadastro de empresas. | Alta |
| RF-02 | O sistema deverá criar o usuário administrador junto com o cadastro da empresa. | Alta |
| RF-03 | O sistema deverá permitir a autenticação por e-mail e senha individuais. | Alta |
| RF-04 | O sistema deverá permitir o cadastro, a consulta, a alteração, a desativação e a reativação de usuários da empresa. | Alta |
| RF-05 | O sistema deverá permitir definir perfis e níveis de acesso para os usuários da empresa. | Alta |
| RF-06 | O sistema deverá autorizar as operações conforme as permissões associadas ao perfil do usuário. | Alta |
| RF-07 | O sistema deverá permitir o cadastro de produtos e insumos. | Alta |
| RF-08 | O sistema deverá permitir a consulta e a alteração dos dados cadastrais dos produtos. | Alta |
| RF-09 | O sistema deverá permitir definir a unidade de medida de cada produto. | Alta |
| RF-10 | O sistema deverá permitir definir o estoque mínimo e, opcionalmente, o estoque máximo de cada produto. | Média |
| RF-11 | O sistema deverá permitir registrar entradas de produtos no estoque. | Alta |
| RF-12 | O sistema deverá permitir registrar saídas de produtos do estoque. | Alta |
| RF-13 | O sistema deverá atualizar o saldo dos produtos conforme as movimentações registradas. | Alta |
| RF-14 | O sistema deverá impedir saídas superiores ao saldo disponível. | Alta |
| RF-15 | O sistema deverá manter o histórico das movimentações de estoque. | Alta |
| RF-16 | O sistema deverá permitir ajustar o saldo para a quantidade contada fisicamente, mediante justificativa. | Alta |
| RF-17 | O sistema deverá identificar produtos com saldo igual ou inferior ao estoque mínimo. | Alta |
| RF-18 | O sistema deverá permitir registrar perdas e descartes, com seus motivos. | Alta |
| RF-19 | O sistema deverá permitir consultar a situação atual do estoque. | Alta |
| RF-20 | O sistema deverá permitir cadastrar receitas utilizando produtos previamente cadastrados. | Alta |
| RF-21 | O sistema deverá permitir definir a quantidade de cada ingrediente necessária para produzir uma unidade da receita. | Alta |
| RF-22 | O sistema deverá calcular a capacidade máxima de produção de cada receita com base no saldo atual dos ingredientes. | Alta |
| RF-23 | O sistema deverá identificar os ingredientes que limitam a capacidade de produção. | Alta |
| RF-24 | O sistema deverá permitir registrar a quantidade produzida de uma receita. | Alta |
| RF-25 | O sistema deverá calcular o consumo de cada ingrediente a partir da composição da receita e da quantidade produzida. | Alta |
| RF-26 | O sistema deverá gerar as saídas dos ingredientes utilizados em cada produção. | Alta |
| RF-27 | O sistema deverá impedir o registro de produção acima da capacidade disponível. | Alta |
| RF-28 | O sistema deverá atualizar o estoque ao confirmar o registro de uma produção. | Alta |
| RF-29 | O sistema deverá recalcular a capacidade das receitas após alterações no estoque. | Alta |
| RF-30 | O sistema deverá identificar lotes próximos do vencimento ou vencidos, quando houver controle de validade. | Alta |
| RF-31 | O sistema deverá identificar o usuário responsável pelas movimentações e produções. | Alta |
| RF-32 | O sistema deverá permitir consultar informações históricas e relatórios de movimentações, perdas e produções por período. | Média |
| RF-33 | O sistema deverá apresentar a necessidade de reposição e a sugestão de quantidade a comprar por produto. | Média |
| RF-34 | O sistema deverá permitir adicionar, substituir e remover uma foto opcional do produto durante seu cadastro ou edição, com prévia antes da confirmação. | Média |
| RF-35 | O sistema deverá permitir consultar e atualizar os dados e as configurações da própria empresa, incluindo os dias de antecedência dos alertas de validade. | Média |
| RF-36 | O sistema deverá permitir cadastrar e consultar categorias de produtos da empresa. | Média |
| RF-37 | O sistema deverá permitir desativar e reativar produtos, preservando seu histórico. | Média |
| RF-38 | O sistema deverá permitir consultar, editar e desativar receitas da empresa. | Alta |
| RF-39 | O sistema deverá permitir que o usuário autenticado altere a própria senha, mediante confirmação da senha atual. | Alta |

A capacidade de uma receita deverá corresponder à parte inteira da menor razão entre o saldo de cada ingrediente e a quantidade desse ingrediente por unidade produzida. Se vários ingredientes apresentarem a mesma menor capacidade, todos serão limitantes. Por exemplo, saldo de 0,6 kg e consumo de 0,05 kg por unidade permitem produzir 12 unidades, desde que os demais ingredientes também atendam a essa quantidade.

A foto deverá ter prévia antes da confirmação. Salvar sem foto deverá ser permitido, com apresentação de imagem padrão; cancelar o formulário deverá descartar as mudanças de foto, e substituir ou remover a imagem deverá preservar saldo, histórico e composição das receitas.

### Premissas

| ID | Descrição |
| --- | --- |
| PE-01 | O responsável pelo cadastro deverá dispor dos dados da empresa e do administrador, incluindo razão social, CNPJ, nome, e-mail e senha. |
| PE-02 | Cada usuário utilizará credenciais individuais; o e-mail identificará uma única conta em todo o sistema. |
| PE-03 | O administrador definirá o perfil dos usuários de acordo com suas responsabilidades no estabelecimento. |
| PE-04 | Os produtos e insumos deverão estar identificados e cadastrados com as unidades de medida utilizadas na operação. |
| PE-05 | Os responsáveis registrarão as entradas, saídas, perdas, ajustes e produções no momento de sua realização. |
| PE-06 | As quantidades informadas deverão corresponder às quantidades efetivamente movimentadas ou contadas fisicamente. |
| PE-07 | O estabelecimento definirá os estoques mínimos e, quando utilizados, os máximos de acordo com sua necessidade de reposição. |
| PE-08 | Os ingredientes deverão estar previamente cadastrados antes da inclusão em uma receita. |
| PE-09 | As quantidades da ficha técnica representarão o consumo de uma unidade produzida. O texto de rendimento será informativo e não será um multiplicador adicional do cálculo. |
| PE-10 | O usuário terá um vínculo com a empresa e as permissões necessárias às operações sob sua responsabilidade. |

### Restrições

| ID | Descrição | Prioridade |
| --- | --- | --- |
| RE-01 | O acesso a dados deverá ficar restrito à empresa do usuário autenticado, inclusive nas consultas por identificador. A empresa da operação deverá ser determinada pela autenticação no servidor. | Alta |
| RE-02 | Usuários desativados deverão ter o login e o uso das rotas protegidas bloqueados, inclusive quando possuírem uma sessão anterior à desativação. | Alta |
| RE-03 | As operações administrativas e de negócio deverão exigir as permissões previstas para cada perfil. | Alta |
| RE-04 | Movimentações de saída deverão respeitar o saldo disponível e preservar saldos não negativos para o produto e seus lotes. | Alta |
| RE-05 | Toda alteração de saldo deverá possuir uma movimentação correspondente no histórico. A edição dos dados cadastrais ou da foto do produto deverá preservar o saldo. | Alta |
| RE-06 | Ajustes de estoque deverão exigir justificativa com pelo menos 10 caracteres e registrar a diferença entre a quantidade contada e o saldo anterior. Uma contagem igual ao saldo atual deverá ser recusada. | Alta |
| RE-07 | As quantidades deverão respeitar a unidade de medida: produtos em unidades inteiras (`un`) aceitarão apenas inteiros; as demais unidades aceitarão até três casas decimais. Entradas e saídas deverão ter quantidade maior que zero; a contagem física poderá ser zero. | Alta |
| RE-08 | A produção deverá ter quantidade inteira maior que zero e não poderá exceder a capacidade calculada no momento da confirmação. | Alta |
| RE-09 | Os ingredientes de uma receita deverão estar cadastrados, ativos e vinculados à mesma empresa da receita. | Alta |
| RE-10 | Cadastrar ou editar uma receita deverá preservar os saldos dos ingredientes. A baixa ocorrerá no registro de uma produção. | Alta |
| RE-11 | Fotos deverão ser opcionais e limitadas a JPEG/JPG, PNG ou WebP, com até 5.242.880 bytes (5 MB). O servidor deverá validar conteúdo, integridade e tamanho, e aplicar as permissões e o isolamento por empresa. | Média |
| RE-12 | O estoque mínimo deverá ser maior ou igual a zero. Quando informado, o estoque máximo deverá ser maior ou igual ao mínimo. | Alta |
| RE-13 | O CNPJ deverá ser único entre as empresas e o e-mail deverá ser único entre todos os usuários, com comparação sem diferenciação de maiúsculas e minúsculas para o e-mail. | Alta |
| RE-14 | Produtos desativados deverão manter seu histórico e ficar indisponíveis para novas movimentações e inclusão em receitas. Um ingrediente desativado em receita existente deverá ser indicado como indisponível e limitar sua capacidade a zero. | Alta |
| RE-15 | Cada receita deverá ter pelo menos um ingrediente, com quantidade maior que zero, sem repetição de produto. O nome deverá ser único entre as receitas ativas da mesma empresa. | Alta |
| RE-16 | A administração da empresa deverá ser preservada: o administrador não poderá desativar a si mesmo nem remover o último administrador ativo. O perfil Administrador manterá as permissões de gerenciar usuários e perfis. | Alta |
| RE-17 | Entradas de produtos com controle de validade deverão registrar a validade do lote. As saídas deverão consumir primeiro os lotes com vencimento mais próximo. Os alertas considerarão lotes com saldo e o prazo configurado pela empresa, com padrão de três dias. | Alta |
| RE-18 | Perdas e descartes deverão informar o motivo da perda. As classificações de motivo como “outro” deverão exigir justificativa. | Alta |
| RE-19 | As movimentações já registradas deverão permanecer disponíveis para consulta, com produto, quantidade anterior e posterior, motivo, responsável e data e hora. Correções deverão gerar novas movimentações de ajuste. | Alta |
| RE-20 | Relatórios deverão validar a ordem das datas, aceitar períodos de até um ano e incluir o dia final na consulta. Quantidades de produtos ou unidades diferentes deverão permanecer identificadas separadamente. | Média |

### Requisitos não Funcionais

Os critérios abaixo expressam condições de qualidade, segurança, consistência e manutenção a serem verificadas durante a implementação.

| ID | Descrição | Prioridade |
| --- | --- | --- |
| RNF-01 | A interface deverá permitir executar os fluxos principais em celular e computador, reorganizando menus, formulários e listas conforme o espaço disponível. | Alta |
| RNF-02 | Formulários e controles deverão ter rótulos identificáveis, foco visível e operação por teclado. Erros deverão ser apresentados por texto e associados aos campos correspondentes. | Alta |
| RNF-03 | As senhas deverão ser armazenadas com hash BCrypt. Senhas e hashes deverão ficar ausentes das respostas da API; as senhas cadastradas deverão ter no mínimo oito caracteres. | Alta |
| RNF-04 | As sessões deverão usar tokens assinados com validade de oito horas. Tokens ausentes, inválidos ou expirados deverão impedir o acesso às rotas protegidas; a chave de produção deverá ser configurada por variável de ambiente. | Alta |
| RNF-05 | O cadastro conjunto de empresa e administrador e as operações de estoque e produção deverão ser transacionais: uma falha deverá desfazer todas as gravações da operação. | Alta |
| RNF-06 | Operações simultâneas sobre um mesmo estoque deverão preservar sua consistência. Saídas e produções concorrentes deverão ser verificadas por testes que comprovem a ausência de saldo negativo. | Alta |
| RNF-07 | Os cálculos de estoque, consumo e capacidade deverão utilizar aritmética decimal que preserve a precisão das quantidades e evite perda de unidades por arredondamento indevido. | Alta |
| RNF-08 | As datas e horas das consultas, dos alertas, do histórico e dos relatórios deverão seguir de forma consistente o fuso `America/Sao_Paulo`. | Alta |
| RNF-09 | A API deverá retornar erros em formato JSON padronizado, com mensagem compreensível e indicação dos campos inválidos quando aplicável, com os detalhes de implementação restritos aos registros internos do servidor. | Alta |
| RNF-10 | O esquema PostgreSQL deverá ser versionado por migrações Flyway. Mudanças de estrutura deverão ser reproduzíveis e preservar os dados existentes; as entidades deverão ser validadas contra o esquema. | Alta |
| RNF-11 | A integração contínua deverá executar os testes do backend e os testes e o build do frontend em pull requests destinados à `main` e em pushes nessa branch. | Alta |
| RNF-12 | O ambiente de produção deverá utilizar HTTPS e banco separado do desenvolvimento, com suas credenciais configuradas por variáveis de ambiente. | Alta |

## Modelo de Dados

Os modelos conceitual, lógico e EER estão na página [Arquitetura da Solução](08-Arquitetura%20da%20Solução.md), junto às decisões sobre lotes, movimentações, receitas, produção, fotos e permissões.

O modelo relaciona a empresa aos seus usuários, perfis, categorias, produtos, receitas e registros operacionais. Cada receita é composta por itens que associam um produto à quantidade consumida por unidade produzida. Cada produção gera saídas dos ingredientes, vinculadas ao usuário responsável e, quando aplicável, aos lotes utilizados.

A arquitetura distingue o esquema existente das alterações planejadas nas migrações. A implementação das entidades e dos serviços deverá acompanhar essas mudanças e manter as regras de integridade definidas nesta especificação.
