# ISTOQUE — segmentação do frontend e integração

## Ponto de partida

Frontend previsto: **React + Vite, com componentes reutilizáveis**. O backend existente será a fonte dos contratos de API e das regras já implementadas. Esta é a proposta de organização que orientou o front-end. A integração está feita para cadastro, login, produtos, categorias e unidades de medida; receitas, movimentações, produção, relatórios e equipe seguem locais (estado em `codigo-fonte/Frontend/istoque/README.md`).

## 1. Primeiro levantamento no repositório

Antes de modificar o frontend, ler os READMEs, a estrutura de projetos, configuração de build, controllers/rotas, DTOs, serviços e testes. Identificar eventuais componentes ou páginas existentes para reutilizá-los.

| Domínio | O que localizar no backend | O que a interface depende disso |
| --- | --- | --- |
| Autenticação | Entrada/saída, credenciais, sessão, expiração e erros | Campos do login, recuperação e proteção das rotas |
| Empresa | Cadastro e criação do administrador; tenant da sessão | Campos e resultado do cadastro |
| Usuários | Perfis, permissões, edição, ativação e desativação | Formulários, menus e ações disponíveis |
| Produtos | Campos, tipos, validações, unidade, limites e paginação | Cadastro, filtros e detalhe |
| Foto | Endpoint ou contrato de arquivo, limites e autorização | Envio, prévia, substituição e remoção |
| Movimentações | Tipos, saldo, justificativa e histórico | Formulário e atualização dos dados após gravação |
| Receitas | Composição, unidades, edição e cálculo de capacidade | Ficha técnica e limitantes |
| Produção | Comando, transação, concorrência e retorno | Revisão de consumo e confirmação segura |
| Alertas | Reposição, validade, datas e lotes | Indicadores e listas |
| Relatórios / notas | Existência das funcionalidades e contratos | Decidir o que pode ser integrado nesta etapa |

Registrar método, caminho, autenticação, corpo, resposta, erros, paginação e origem do tenant apenas depois de encontrá-los no código ou em uma especificação oficial do próprio backend.

## 2. Organização candidata

| Diretório | Responsabilidade |
| --- | --- |
| `src/app/` | Inicialização, rotas, provedores e composição de layouts |
| `src/shared/ui/` | Button, Input, Select, Modal, Badge, Table, EmptyState e Feedback |
| `src/shared/styles/` | Tokens e estilos derivados do Figma |
| `src/shared/api/` | Cliente HTTP e tratamento comum, definidos conforme a API real |
| `src/shared/lib/` | Formatação e funções puras compartilhadas |
| `src/features/auth/` | Login e cadastro com composição original do Figma |
| `src/features/products/` | Catálogo, formulário, detalhe e foto opcional |
| `src/features/stock/` | Movimentações, histórico, alertas e reposição |
| `src/features/recipes/` | Catálogo e composição das fichas técnicas |
| `src/features/production/` | Quantidade, revisão de consumo e resultado |
| `src/features/users/` | Usuários, perfis e ativação |
| `src/features/reports/` | Relatórios, se sustentados pelo backend |
| `src/features/imports/` | Importação de notas, quando houver contrato disponível |

Dentro de cada domínio, separar páginas, componentes próprios e acesso a dados. Não duplicar componentes visuais nem espalhar chamadas HTTP em botões e tabelas. Evitar dependências novas antes de verificar as já usadas no projeto.

A estrutura efetivamente adotada difere em parte desta proposta: o código compartilhado fica em `src/components/`, `src/lib/`, `src/utils/`, `src/stores/` e `src/styles/`, e não em `src/shared/`. Ela está descrita no README do app, em `codigo-fonte/Frontend/istoque/README.md`.

## 3. Preservação de login e cadastro

1. Usar os quatro frames do SVG exportado do Figma, disponíveis em `references/figma/`.
2. Reutilizar os ativos originais e componentes equivalentes existentes no repositório.
3. Preservar layout, tipografia, cores, logo, ilustrações e textos de apresentação.
4. Adaptar exclusivamente os campos e suas validações ao contrato do backend.
5. Comparar screenshots nas dimensões dos frames desktop e mobile.

A implementação atual fica em `src/features/auth/`, com os componentes em `components/` e os dois ativos locais em `assets/`. Títulos, textos e controles são HTML real. O cadastro básico tem seis campos em uma etapa, definidos pela modelagem de dados e pelo contrato da API e detalhados em [cadastro-basico.md](cadastro-basico.md). O módulo está integrado à API: o login chama `POST /api/auth/login` e o cadastro chama `POST /api/auth/cadastro`, e a sessão fica em `src/stores/session-store.jsx`.

## 4. Componentes de domínio

| Componente | Responsabilidade |
| --- | --- |
| ProductCard / ProductVisual | Foto opcional ou ilustração padrão, identificação e saldo |
| ProductForm | Dados cadastrais, limites e validações |
| ProductPhotoField | Seleção, prévia, rejeição de arquivo, troca e remoção |
| StockStatus / StockMeter | Situação e comparação com limites |
| MovementForm / MovementTable | Registro e rastreabilidade |
| RecipeCard / IngredientEditor | Capacidade e consumo por porção |
| ProductionReview | Quantidade, consumo e saldo resultante |
| OperationResult | Sucesso ou falha após retorno do servidor |
| PermissionGate | Apresentação conforme permissões; não substitui autorização da API |

O front-end já possui componentes de base e `ProductPhotoField`/`ProductVisual`. Produtos, categorias e unidades de medida usam a API; a camada de estado em memória que resta (receitas, movimentações, produção, relatórios, equipe e fotos) deve ser substituída por integração conforme os contratos reais, e não deve ser tratada como banco de dados ou autenticação.

## 5. Sequência de construção

| Etapa | Entrega | Condição para concluir |
| --- | --- | --- |
| 1 | Inventário do backend e do frontend existente | Contratos identificados com referência ao código |
| 2 | Tokens e componentes compartilhados | Estilos compatíveis com o Figma |
| 3 | Login/cadastro originais e sessão | Fluxo real testado; visual preservado |
| 4 | Consulta, cadastro e edição de produto, incluindo foto | Dados e arquivos persistidos com autorização |
| 5 | Movimentações e histórico | Saldos e erros consistentes com o servidor |
| 6 | Ficha técnica e capacidade | Consumo e unidades coerentes |
| 7 | Produção | Baixa transacional, tratamento de concorrência e recálculo |
| 8 | Alertas, reposição e usuários | Regras e permissões reais validadas |
| 9 | Relatórios e importação | Implementar apenas após confirmar suporte e prioridade |

## 6. Verificação

Testar os fluxos completos, incluindo falhas relevantes. Para foto: produto sem imagem, upload válido, cancelamento, troca, remoção, limite de tamanho, tipo não permitido e arquivo corrompido. No backend, verificar isolamento por empresa e autorização sobre as imagens.

Para produção: saldo exato, quantidade acima do limite, alteração de estoque entre revisão e confirmação, prevenção de duplicidade e ausência de baixa parcial. Para acesso: credencial inválida, conta desativada, sessão expirada e comparação visual com o Figma.

## Pendências

A integração com o backend cobre cadastro, login, produtos, categorias e unidades de medida. Faltam as rotas de receitas, movimentações, produção, relatórios, equipe e fotos, além do token de autenticação (HT001) e do isolamento entre empresas no servidor (HT002); os contratos devem ser conferidos no código antes de substituir os dados locais.
