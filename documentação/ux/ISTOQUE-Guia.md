# ISTOQUE — proposta de interfaces e fluxos

Versão de revisão • 28 de setembro de 2026

Esta proposta organiza a operação de estoque de um restaurante em torno de três tarefas: acompanhar ingredientes, manter fichas técnicas e registrar a produção com consumo rastreável. A identidade usa o verde-petróleo, o amarelo e o fundo claro do ISTOQUE, com Poppins nos títulos e Inter na interface.

## O que foi entregue

- `telas/`: capturas do próprio sistema em funcionamento (modo demonstração), em desktop e celular, com a tabela de telas, rotas e requisitos em [telas/README.md](telas/README.md). Elas substituem o protótipo HTML anterior.
- `requisitos-atualizados.md`: aviso que aponta para a [Especificação do Projeto](../02-Especificação%20do%20Projeto.md), a versão vigente dos requisitos (inclui RF-34 e RE-11).
- `images/istoque/fluxos-operacionais.svg`: mapa vetorial dos fluxos de acesso, estoque e produção, incluindo condições de bloqueio e responsabilidades do servidor.
- `images/istoque/`: 31 capturas de telas e estados, incluindo desktop e celular. As telas móveis representam o primeiro viewport; o restante pode ser explorado no sistema em modo demonstração.
- `svg/`: 26 telas operacionais e três fluxos individuais. As telas atuais de acesso são documentadas em PNG e implementadas em React/CSS. Não há Auto Layout ou ligações nativas de protótipo nos SVGs exportados.
- `codigo-fonte/Frontend/istoque/`: código-fonte do front-end, organizado por features, com dependências fixadas e testes das regras de saldo e produção.

## Login e cadastro básico — atualização de 28/09

Login e cadastro foram reconstruídos com elementos React e CSS responsivo. O mascote é um SVG inline e as texturas são uma imagem JPG (login) e um SVG (cadastro); a tela inteira não é utilizada como imagem. Textos, títulos, campos e botões são elementos reais. Foram removidas as anotações de dimensão. O layout mantém a paleta e a composição do Figma, com campos legíveis em telas menores.

Login: e-mail do usuário e senha. Cadastro básico em uma etapa: razão social, CNPJ, nome do responsável, e-mail do usuário, senha e confirmação. Todos obrigatórios. Nome fantasia, telefone e e-mail da empresa ficam para depois. A modelagem de dados distingue os dados da empresa das credenciais do usuário. Os campos seguem o contrato da API (`POST /api/auth/login` e `POST /api/auth/cadastro`), e as telas enviam os dados para ela.

O relatório anterior de igualdade de pixels correspondia à camada SVG pronta e não se aplica à reconstrução atual. A nova versão foi revisada visualmente e testada em desktop e celular. Detalhes e mapeamento: [cadastro-basico.md](cadastro-basico.md).

## Situação no Figma

Arquivo: https://www.figma.com/design/TXXT9hanssH7rJL1ECmWL3/ISTOQUE

Na etapa anterior foram criados o guia visual, as variáveis, os estilos e os componentes básicos na página **01 · Guia e componentes**. A inserção das telas no Figma ainda não foi concluída: a página **02 · Produto e fluxos** ainda não contém as telas desta entrega.

Os componentes nativos são uma primeira base: alguns rótulos de variantes de status e de carregamento ainda precisam ser refinados. O protótipo e os SVGs desta entrega apresentam os textos corretos para os estados demonstrados. As telas originais da página inicial foram preservadas.

Para levar esta proposta ao arquivo: instale as fontes Inter e Poppins incluídas no projeto, importe os SVGs em uma nova área de revisão e use-os como referência para montar os frames com os componentes da página de guia. A importação de SVG não converte a tela em componentes React ou em um design system nativo do Figma. Efeitos de desfoque/sombra e estados de interação são melhor avaliados no HTML e nas capturas PNG.

## Origem e limites do escopo

A base funcional é o documento de requisitos do projeto, com RF01–RF34. As telas originais de acesso vêm da exportação SVG do Figma, em `references/figma/`. A tabela abaixo registra as referências visuais que orientaram a composição da proposta.

| Referência visual | Aspecto aproveitado | Aplicação no ISTOQUE |
| --- | --- | --- |
| Dashboard ilustrado laranja | Navegação lateral, hierarquia do painel e formas suaves | Visão geral com indicadores, reposição e capacidade de produção |
| Aplicativo de mercado | Busca, categorias e cartões de ingredientes | Catálogo de estoque com saldo, mínimo e validade |
| Aplicativo de saladas | Composição e quantidades | Ficha técnica por porção |
| Aplicativo de hambúrguer | Destaque do produto e ação de preparo | Detalhe da receita com capacidade e ingrediente limitante |
| Aplicativo médico | Listas, datas e estados legíveis | Histórico e alertas |
| Aplicativo preto e laranja | Escolha, revisão e confirmação | Revisão de consumo e sucesso de produção |

As ilustrações das telas operacionais foram criadas para o protótipo. O mascote é um SVG inline e a textura do acesso usa os arquivos de `features/auth/assets/`.

Não foi incluído módulo de vendas nem 2FA, pois eles não constam dos requisitos disponíveis. Recuperação de senha, importação de notas, relatórios por período e a matriz de perfis abaixo são propostas para validação.

## Arquitetura das telas

| Área | Tela / estado | Objetivo e próximo passo |
| --- | --- | --- |
| Acesso | Login, cadastro da empresa, recuperação | Entrar no contexto da empresa; cadastro cria o administrador |
| Visão geral | Indicadores, estoque baixo, validades, movimentações | Identificar a próxima ação operacional |
| Estoque | Catálogo, busca, categoria, filtro de mínimo, vazio | Localizar ingrediente e abrir detalhe |
| Produto | Saldo, limites, validade, receitas vinculadas, histórico | Editar dados ou registrar movimentação |
| Movimentação | Entrada, saída, perda, ajuste | Revisar saldo e confirmar com motivo |
| Receitas | Catálogo com capacidade e limitante | Consultar ficha técnica ou criar uma |
| Ficha técnica | Ingredientes e consumo por porção | Editar sem baixar estoque ou iniciar produção |
| Produção | Revisão, bloqueio, sucesso | Baixar ingredientes e recalcular as capacidades |
| Reposição | Lista sugerida e exportação CSV | Planejar compras e registrar recebimentos |
| Relatórios | Período, tipos e perdas por ingrediente | Analisar e exportar movimentações — extensão proposta |
| Equipe | Usuários, perfis e ativação | Administrar acessos — perfis sujeitos à validação |
| Importação | Nota de exemplo e vínculo dos itens | Conferir unidades antes da entrada — extensão proposta |

## Fluxos e regras

### Estoque

1. Buscar ou filtrar ingredientes.
2. Abrir o detalhe e selecionar o tipo de movimentação.
3. Informar quantidade e motivo; visualizar o saldo resultante.
4. Confirmar e registrar responsável, data, quantidade e motivo.
5. Atualizar alertas, reposição e capacidades das receitas.

Entradas somam ao saldo; saídas e perdas subtraem; ajustes definem o saldo físico correto. O protótipo exige motivo em todos os tipos, uma escolha de UX mais restritiva que a exigência mínima de ajustes. Quantidades negativas e saída superior ao saldo são bloqueadas. Itens em `un` exigem movimentações inteiras.

O alerta ocorre quando **saldo ≤ mínimo**, inclusive na igualdade. A lista de reposição propõe completar o saldo até o máximo cadastrado. Essa fórmula é uma decisão de produto sugerida para RF33 e pode ser trocada por outro alvo de compra.

### Ficha técnica e produção

Salvar uma ficha não movimenta estoque. Cada quantidade é o consumo de uma porção, na unidade de controle do ingrediente.

`capacidade = menor valor de floor(saldo do ingrediente / consumo por porção)`

O ingrediente com menor rendimento é o limitante. No exemplo inicial:

| Ingrediente | Saldo | Por hambúrguer | Rendimento |
| --- | --- | --- | --- |
| Pão | 36 un | 1 un | 36 |
| Carne | 4,5 kg | 0,15 kg | 30 |
| Queijo | 1,2 kg | 0,04 kg | 30 |
| Tomate | 0,6 kg | 0,05 kg | 12 |
| Alface | 0,6 kg | 0,02 kg | 30 |

Logo, a capacidade é **12 porções**. Ao produzir 5, o tomate passa para 0,35 kg e a capacidade restante para 7. As demais receitas que utilizam esses ingredientes também são recalculadas.

O fluxo mostra a quantidade, o consumo total por ingrediente e o saldo após a produção. Quantidade fracionária, zero ou superior à capacidade bloqueia a confirmação. O servidor futuro deve validar novamente os saldos, resolver concorrência e efetuar todas as baixas em uma única transação. O protótipo simula a baixa conjunta em memória; não implementa transações de banco de dados.

### Acesso e equipe

Sem login, o sistema abre na demonstração, com dados fictícios. Com login, a API verifica as credenciais. O formulário de recuperação de senha é só uma simulação e não envia mensagens. Na demonstração, os usuários criados ou desativados existem apenas na sessão local.

| Perfil padrão | Responsabilidade sugerida |
| --- | --- |
| Administrador | Empresa, usuários, perfis e toda a operação |
| Gerente | Estoque, ajustes, receitas, produção e relatórios |
| Funcionário | Consulta e registros operacionais permitidos |

A matriz exata precisa ser aprovada com a equipe. No produto real, cada consulta e mutação deve verificar a empresa e a permissão no servidor. Desativar usuário deve impedir novas sessões e invalidar acessos conforme a política definida.

### Nota e relatórios — extensões

A nota é uma simulação explícita com três itens. Não existe upload real, OCR, extração fiscal, integração com fornecedor ou envio externo. O item sem vínculo bloqueia a confirmação até ser associado a um produto com unidade compatível. A confirmação adiciona três entradas ao histórico local.

Os relatórios contam registros por tipo e mostram perdas com suas unidades. O protótipo não soma kg, litros e unidades em um único total físico. Os CSVs são gerados localmente. Na demonstração, a referência temporal de alertas e períodos é 26/09/2026, indicada na interface; com login, é a data de hoje.

## Foto opcional de produto — atualização aprovada

O RF-34 foi acrescentado ao documento principal. Cadastro e edição permitem adicionar uma foto, visualizar a prévia, substituir ou remover a imagem. A foto aparece no cartão do estoque, no detalhe e nas miniaturas do ingrediente. Sem foto, permanece a ilustração padrão.

São aceitos JPEG/JPG, PNG e WebP até 5 MB (5.242.880 bytes). Tipos não permitidos, arquivos maiores e imagens corrompidas geram mensagem de erro, mantendo a foto anteriormente válida. Cancelar a edição descarta a troca ou remoção; salvar aplica a alteração sem modificar o saldo.

No protótipo, a imagem é lida localmente e permanece na memória até recarregar. Não há envio a servidor. Para o produto real, a RE-11 exige validação no servidor e acesso conforme a empresa e as permissões do usuário.

## Cobertura dos requisitos

| Requisitos | Superfície da proposta | Limite desta entrega |
| --- | --- | --- |
| RF01–RF03 | Cadastro da empresa e acesso | Cadastro e login integrados à API; sem token (HT001) e sem isolamento entre empresas no servidor (HT002) |
| RF04–RF06 | Equipe, perfis e ativação | Simulação local; autorização depende do backend |
| RF07–RF10 | Cadastro, edição, detalhe, unidade e limites | Estado em memória; unidade preservada na edição |
| RF11–RF19 | Entradas, saídas, ajustes, perdas, mínimo e histórico | Regras de quantidade demonstradas; persistência e auditoria dependem do backend |
| RF20–RF23 | Ficha por porção, capacidade e limitante | Cálculo funcional com dados de demonstração |
| RF24–RF29 | Produção, consumo, bloqueio e recálculo | Baixa conjunta local; revalidação e transação ficam no servidor |
| RF30 | O produto indica se controla validade, a data é informada em cada entrada, e há painel de alertas | O produto mostra só a validade do lote que vence primeiro; não há controle de lotes nem FEFO |
| RF31–RF32 | Responsável e histórico | Na demonstração, identidade fictícia de David Rocha; com login, o usuário da sessão. O histórico ainda fica só na página: não é trilha de auditoria real |
| RF33 | Lista sugerida de reposição | Fórmula proposta: completar até o máximo |
| RF34 | Foto opcional no cadastro e edição | Seleção, prévia, troca, remoção e validação locais; armazenamento depende do backend |

## Componentes e implementação React + Vite

O projeto usa React com Vite, CSS responsivo, ícones e ilustrações SVG. A navegação por hash evita dependências extras. Produtos, categorias e unidades de medida vêm da API (`src/lib/api-client.js` e `src/features/*/api/`); os demais dados da demonstração ficam em memória.

| Pasta | Responsabilidade |
| --- | --- |
| `src/main.jsx` | Inicialização do React |
| `src/styles/` | Tokens, estilos, estados e breakpoints, em um arquivo por componente ou tela, reunidos em `styles/index.css` |
| `src/app/` | Uma tela por rota, roteador por hash, providers e modais de operação |
| `src/components/` | Button, Badge, Field, Modal, Icon, Empty, Stat, FoodArt e o layout das telas internas |
| `src/features/` | Um módulo por domínio: auth, products (com StockStatus, StockMeter e a foto opcional), stock, recipes, production, users, reports e imports |
| `src/stores/` | Estado da demonstração e da interface |
| `src/utils/` | Regras puras de saldo, capacidade e produção (com testes), formatação e exportação de CSV |
| `src/testing/mocks/` | Produtos, receitas, histórico e usuários fictícios |

Principais contratos:

```jsx
<Button variant="primary | secondary | accent" icon="plus" disabled={false} />
<Field label="Quantidade" hint="Em kg"><input /></Field>
<StockStatus product={product} />
<StockMeter product={product} />
<Modal title="Registrar produção" onClose={close} wide />
<ProductionModal recipe={recipe} products={products} onConfirm={produce} onClose={close} />
```

Tokens principais: `--teal #164D4E`, `--amber #F5B84F`, `--paper #F9F6EF`, `--panel #FFFDF8`, `--ink #1F1813`, `--line #E8E1D6`, `--danger #B64232`. O CSS usa bordas arredondadas, estados de foco visíveis, `dialog` nativo, rótulos de formulário e mensagens de status. A versão móvel troca a barra lateral por menu e navegação inferior. Tabelas amplas têm rolagem horizontal dentro do painel.

Para executar o fonte:

```bash
cd codigo-fonte/Frontend/istoque
npm ci
npm run dev
```

Para gerar a distribuição: `npm run build`. Para verificar as regras de domínio: `npm test`.

## Revisão realizada

- Foto de produto verificada: cadastro com e sem imagem, prévia, cartão e detalhe, edição, cancelamento, troca, remoção, saldo preservado e rejeição por tipo/tamanho/integridade.

- Build de produção gerado com sucesso.
- Testes de domínio aprovados: limites de produção, baixa sem alterar a origem, recálculo de outras receitas, mínimo inclusivo, saída sem saldo, ajuste a zero e unidades inteiras.
- Navegação e interações verificadas em Chromium: confirmação de produção, bloqueio por capacidade, importação sem vínculo, busca vazia e saída excessiva.
- Galeria com 31 capturas. As telas operacionais foram conferidas em desktop de 1440 px e celular de 390 px; o acesso foi revisado em 1440 × 900, 1440 × 894 e 375 × 812. A navegação de acesso também foi conferida sem transbordamento em 320, 390, 768, 1024 e 1920 px. Tabelas preservam rolagem interna.
- Acesso: navegação, bloqueio por confirmação de senha divergente, cadastro e login enviados à API, recuperação simulada e fechamento por Escape aprovados. Sem erros JavaScript.
- Revisão visual das telas de visão geral, ficha técnica, produção e versão móvel; exportação vetorial revisada separadamente.

Produtos, categorias, unidades de medida, cadastro e login usam a API. Receitas, movimentações, produção, relatórios, equipe e foto do produto ainda são locais, e não há token, permissões efetivas, isolamento entre empresas no servidor nem processamento de notas. As capturas em `telas/` são uma referência visual do sistema. Antes da implementação real, confirmar também controle de lotes/validade, conversões de unidades, política de ajustes e concorrência na produção.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: o rótulo fica dentro do campo e, com foco ou texto, sobe e encolhe (só CSS, com `:placeholder-shown`, por isso o input leva `placeholder=" "`, e o rótulo faz o papel de dica); altura de 54 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado. Sugestões de senha do navegador pertencem ao navegador, e não são uma imagem ou parte do layout.
