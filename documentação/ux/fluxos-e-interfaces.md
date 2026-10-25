# ISTOQUE — fluxos e interfaces

> Proposta de UX, atualizada em 23/10/2026 com o estado do sistema implementado. Base: documentação de requisitos de estoque, receitas e produção, com inclusão da foto opcional de produto. As capturas atuais do sistema estão em [telas/README.md](telas/README.md).

## 1. Referência visual e implementação

O [Figma ISTOQUE](https://www.figma.com/design/TXXT9hanssH7rJL1ECmWL3/ISTOQUE) continua como referência de composição e paleta. Em 28/09/2026, login e cadastro foram reconstruídos com React e CSS responsivo. Imagens são utilizadas somente no mascote e na textura; títulos, textos, botões e campos são elementos HTML. As anotações de dimensões foram removidas.

Os [quatro frames originais](references/figma/) permanecem como referência histórica, sem modificações no arquivo Figma. A implementação atual substitui as camadas SVG prontas usadas na versão anterior. Os detalhes dos campos estão em [cadastro-basico.md](cadastro-basico.md).

## 2. Visão dos fluxos

![Fluxos de acesso, estoque e produção](images/istoque/fluxos-operacionais.svg)

O diagrama distingue a sequência de telas das validações necessárias no servidor. Cadastro, login, produtos, categorias e unidades de medida já usam a API; a navegação de receitas, movimentações, produção, relatórios e equipe usa dados locais. Token de autenticação (HT001), isolamento entre empresas no servidor (HT002), auditoria e transações ainda não estão implementados.

| Área | Requisitos relacionados | Entrega de interface |
| --- | --- | --- |
| Empresa e acesso | RF-01 a RF-03 | Preservar telas originais; alinhar campos ao backend |
| Equipe e permissões | RF-04 a RF-06 | Cadastro e ativação; matriz de perfis proposta |
| Produtos | RF-07 a RF-10 e RF-34 | Cadastro, edição, foto opcional e consulta |
| Estoque | RF-11 a RF-19, RF-30 a RF-33 | Movimentações, alertas, histórico e reposição |
| Receitas | RF-20 a RF-23 | Ficha por porção, capacidade e limitante |
| Produção | RF-24 a RF-29 | Revisão, bloqueio e confirmação com baixa conjunta |
| Nota e relatórios por período | Ideias adicionais do projeto | Fluxos propostos, sujeitos à compatibilidade com o backend |

## 3. Login e cadastro básico

O login solicita e-mail do usuário e senha: o e-mail é único no sistema e identifica a conta. O cadastro inicial, em uma etapa, solicita razão social, CNPJ, nome do responsável, e-mail do usuário, senha e confirmação. Os seis campos são obrigatórios. O CNPJ entrou no cadastro porque é obrigatório e único na API. Nome fantasia, e-mail da empresa e telefone ficam para depois. Ver [mapeamento dos campos e limites](cadastro-basico.md).

Campos vazios, CNPJ fora do formato, senha com menos de 8 caracteres ou confirmação divergente impedem a submissão. Após a validação local, o cadastro envia os dados para `POST /api/auth/cadastro`, que cria a empresa e o administrador, e o login envia e-mail e senha para `POST /api/auth/login`. Erros da API aparecem no campo correspondente ou acima do botão.

![Login React](images/istoque/16-acesso.png)

![Cadastro básico React](images/istoque/17-cadastro.png)

| Login móvel | Cadastro móvel |
| --- | --- |
| ![Login móvel](images/istoque/28-mobile-acesso.png) | ![Cadastro móvel](images/istoque/31-mobile-cadastro.png) |

A recuperação permanece uma proposta em modal, sem envio de e-mail.

![Recuperação proposta](images/istoque/18-recuperacao.png)

## 4. Visão geral

**Objetivo:** mostrar o que exige atenção e oferecer acesso rápido às operações.

- Produtos cadastrados, itens com saldo menor ou igual ao mínimo e alertas de validade.
- Atalhos para movimentar estoque, registrar produção e planejar reposição.
- Últimos registros do histórico e prévia da capacidade de uma receita.

![Visão geral desktop](images/istoque/01-visao-geral.png)

## 5. Produtos, estoque e foto opcional

### 5.1 Consulta

O usuário busca por nome, escolhe uma categoria ou filtra itens com estoque baixo. Cada cartão informa nome, saldo, unidade, mínimo, validade e estado. Selecionar um cartão abre o detalhe com histórico e receitas relacionadas.

![Catálogo de estoque](images/istoque/02-estoque.png)

![Detalhe do produto](images/istoque/03-produto.png)

### 5.2 Cadastro e edição

1. Abrir “Novo produto” ou “Editar produto”.
2. Informar os campos cadastrais e os limites de estoque.
3. Opcionalmente, adicionar uma foto e conferir a prévia.
4. Validar os dados e salvar.
5. Exibir o produto com a foto selecionada ou com a ilustração padrão.

No protótipo, novos produtos iniciam com saldo zero e são abastecidos por uma entrada. Na edição, a unidade é preservada para evitar inconsistência com registros anteriores. Essas decisões devem ser confrontadas com as regras já implementadas no backend.

![Cadastro com campo de foto](images/istoque/20-novo-produto.png)

### 5.3 RF-34 — foto opcional

- Adicionar, substituir e remover foto no cadastro ou na edição.
- Aceitar JPEG/JPG, PNG e WebP até 5 MB (5.242.880 bytes).
- Exibir prévia antes de salvar.
- Permitir salvar sem imagem e usar ilustração padrão nesse caso.
- Rejeitar arquivo inválido, corrompido ou acima do limite com mensagem clara, preservando a imagem anteriormente válida.
- Cancelar descarta a troca ou remoção; salvar aplica a alteração sem modificar o estoque.
- Apresentar a foto no cartão, no detalhe e nas miniaturas de ingredientes.

O protótipo lê a imagem localmente e a mantém na sessão. No produto real, a API deve validar o arquivo, persistir a associação e controlar acesso por empresa e permissão. A RE-11 formaliza essa exigência. Não foi definido um endpoint ou serviço de armazenamento sem examinar o backend.

![Edição com prévia, substituição e remoção](images/istoque/29-editar-foto-produto.png)

### 5.4 Busca sem resultados

Preservar os filtros e oferecer “Limpar filtros”. Uma resposta vazia não deve ser confundida com erro de rede ou falha de permissão.

![Busca sem resultados](images/istoque/19-estoque-vazio.png)

## 6. Movimentações e histórico

**Fluxo:** selecionar ingrediente → escolher operação → informar quantidade e motivo → revisar saldo → confirmar → atualizar histórico e capacidades.

| Operação | Efeito | Validação |
| --- | --- | --- |
| Entrada | Soma ao saldo | Quantidade positiva e unidade compatível |
| Saída | Subtrai do saldo | Quantidade positiva, sem ultrapassar saldo |
| Perda | Subtrai do saldo e identifica o descarte | Quantidade válida e motivo |
| Ajuste | Define o saldo físico correto | Saldo não negativo e justificativa |

A interface pede motivo em todos os tipos de movimentação. A exigência documental mínima de justificativa é para os ajustes; confirmar se o backend adota uma regra mais restritiva. Itens controlados em unidades usam quantidades inteiras nas movimentações.

![Histórico de movimentações](images/istoque/04-movimentacoes.png)

![Saída bloqueada por saldo insuficiente](images/istoque/21-movimentacao-bloqueada.png)

O histórico registra produto, tipo, quantidade, unidade, data/hora e responsável. A autorização e a identificação do responsável devem vir da sessão no servidor. Uma falha na gravação deve manter o formulário preenchido e evitar mensagem falsa de sucesso.

## 7. Receitas e ficha técnica

**Fluxo:** consultar receitas → abrir ou criar ficha → definir consumo por porção → salvar → calcular capacidade.

Salvar a ficha técnica não baixa estoque. Cada ingrediente deve estar cadastrado, aparecer uma única vez na ficha e ter consumo positivo na unidade de controle correspondente. Conversões de unidades dependem de regra explícita.

![Receitas e capacidades](images/istoque/05-receitas.png)

![Ficha técnica com ingrediente limitante](images/istoque/06-ficha-tecnica.png)

![Formulário de ficha técnica](images/istoque/22-nova-ficha.png)

A capacidade é o menor valor inteiro de `saldo / consumo por porção` entre os ingredientes. O ingrediente que determina esse valor é o limitante. No exemplo inicial, 0,6 kg de tomate e consumo de 0,05 kg por hambúrguer limitam a receita a 12 porções.

## 8. Produção

**Fluxo:** abrir ficha → informar porções → revisar consumo e saldo posterior → confirmar → registrar baixas → recalcular estoque, alertas e receitas.

![Revisão de consumo antes da confirmação](images/istoque/07-producao-revisao.png)

Quantidade zero, fracionária ou superior à capacidade bloqueia a confirmação. O erro deve informar o limite disponível.

![Produção bloqueada](images/istoque/08-producao-bloqueada.png)

Após confirmar, exibir o sucesso e a capacidade restante. No exemplo, produzir 5 hambúrgueres reduz o tomate de 0,6 kg para 0,35 kg e a capacidade da receita de 12 para 7.

![Confirmação de produção](images/istoque/09-producao-sucesso.png)

No backend, validar novamente os saldos e aplicar todas as baixas em uma transação. Se outra operação consumir estoque durante a revisão, atualizar os dados e exigir nova conferência. A prevenção de envio duplicado deve ser definida a partir das capacidades reais da API.

## 9. Reposição e validade

Produtos com saldo **menor ou igual ao mínimo** geram indicação de reposição. A fórmula sugerida completa o saldo até o máximo cadastrado; ela é uma decisão de UX para apoiar RF-33, sujeita à confirmação com o backend.

![Lista de reposição](images/istoque/10-reposicao.png)

O cadastro do produto só indica se ele controla validade; a data é informada em cada entrada de estoque, como na modelagem de dados, em que a validade pertence ao lote. O produto mostra a validade do lote que vence primeiro, e essas datas podem gerar alertas de proximidade e vencimento. A demonstração usa a data fixa de 26/09/2026 e janela de três dias. Ela não implementa lotes nem FEFO. Janela de aviso, fuso horário, política para vencidos e controle por lote precisam seguir o domínio do backend.

## 10. Equipe

O administrador consulta usuários, cadastra pessoas e ativa ou desativa seus acessos. Administrador, Gerente e Funcionário são os perfis padrão que a API cria para cada empresa; a lista está disponível em `GET /api/perfis`.

![Equipe e perfis](images/istoque/12-equipe.png)

Alteração e consulta de dados de usuário fazem parte de RF-04, mas a demonstração ainda não oferece um formulário completo de edição de usuário. Restringir botões na interface não substitui autorização no servidor.

## 11. Extensões propostas

### 11.1 Importação de notas

**Fluxo proposto:** selecionar documento → interpretar itens → vincular produtos → conferir quantidades e unidades → confirmar entradas.

O protótipo usa uma nota fictícia, sem upload ou interpretação de documentos reais. Um item sem vínculo impede a confirmação. Antes de construir a integração, conferir quais formatos, extração, validações e prevenção de duplicidade o backend oferece.

![Importação de nota — simulação](images/istoque/13-importacao.png)

![Revisão e vínculo dos itens da nota](images/istoque/14-revisao-da-nota.png)

### 11.2 Relatórios por período

O usuário escolhe o período, consulta os registros por tipo e as perdas por ingrediente e pode exportar CSV. Quantidades em kg, litros e unidades não são somadas como se fossem a mesma grandeza.

![Relatórios](images/istoque/11-relatorios.png)

## 12. Interfaces móveis

A proposta usa menu lateral recolhido e navegação inferior, mantendo os mesmos fluxos. As tabelas amplas têm rolagem horizontal dentro do painel. As capturas mostram o primeiro viewport; os conteúdos continuam por rolagem.

| Visão geral | Estoque |
| --- | --- |
| ![Visão geral móvel](images/istoque/23-mobile-visao-geral.png) | ![Estoque móvel](images/istoque/24-mobile-estoque.png) |

| Receitas | Ficha técnica |
| --- | --- |
| ![Receitas no celular](images/istoque/25-mobile-receitas.png) | ![Ficha no celular](images/istoque/26-mobile-ficha.png) |

| Produção | Foto de produto |
| --- | --- |
| ![Produção no celular](images/istoque/27-mobile-producao.png) | ![Foto no celular](images/istoque/30-mobile-foto-produto.png) |

## 13. Estados e critérios de aceite

| Situação | Comportamento esperado |
| --- | --- |
| Carregando dados | Indicar carregamento sem apagar o contexto necessário |
| Lista vazia | Explicar o motivo e oferecer ação adequada |
| Campo inválido | Mensagem junto ao campo; preservar dados válidos |
| Sem permissão | Impedir ação no servidor e explicar a indisponibilidade |
| Falha de rede | Preservar formulário e permitir nova tentativa segura |
| Confirmação em andamento | Evitar submissões duplicadas |
| Operação concluída | Confirmar somente após sucesso da API |
| Foto ausente | Usar a ilustração padrão |
| Arquivo rejeitado | Explicar tipo, tamanho ou integridade; preservar foto válida |

Carregamento, falha de rede, sessão expirada e permissões reais ainda dependem da integração. No sistema em modo demonstração foram verificados os limites de produção e saída, recálculo das receitas, busca vazia, vínculo obrigatório da nota e dez cenários de foto de produto.

## 14. Próxima etapa de implementação

Seguir a [segmentação do frontend e o roteiro de análise do backend](segmentacao-frontend.md). Os requisitos vigentes, com RF-34 e RE-11, estão na [Especificação do Projeto](../02-Especificação%20do%20Projeto.md); o arquivo [requisitos-atualizados.md](requisitos-atualizados.md) apenas aponta para ela.

Os SVGs das 26 telas operacionais estão em [`svg/`](svg/). São referências sem Auto Layout, componentes nativos ou ligações de protótipo. As cinco capturas de acesso e recuperação atuais estão em PNG; as versões SVG antigas foram retiradas para evitar referências desatualizadas.
