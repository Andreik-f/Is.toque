
# Projeto de Interface

## User Flow

Fluxo de usuário (User Flow) é uma técnica que permite ao desenvolvedor mapear todo fluxo de navegação do usuário na aplicação. Essa técnica funciona para alinhar os caminhos e as possíveis ações que o usuário pode fazer junto com os membros de sua equipe.

Os fluxos abaixo foram montados a partir das rotas reais do sistema (navegação por hash, definida em `src/config/paths.js` e `src/app/router.jsx`). Detalhes de regras e estados estão em [fluxos-e-interfaces](ux/fluxos-e-interfaces.md).

### Acesso

Sem sessão, o endereço sem hash abre a página inicial. Quem já entrou vai direto para a visão geral.

```mermaid
flowchart LR
    A["#inicio<br/>Página inicial"] -->|Entrar| B["#login"]
    A -->|Criar conta da empresa| C["#cadastro"]
    B -->|Cadastre-se| C
    C -->|Entrar| B
    B -->|Esqueceu a senha?| R["#recuperar<br/>(simulação)"]
    R --> B
    B -->|API valida e-mail e senha| D["#dashboard<br/>Visão geral"]
    C -->|API cria empresa e administrador| D
    D -->|Sair| B
```

### Estoque

```mermaid
flowchart LR
    D["#dashboard<br/>Visão geral"] --> E["#estoque"]
    E -->|Novo produto| M1[["Janela: novo produto"]]
    M1 -->|Salvar produto| E
    E -->|Cartão do produto| P["#produto/id"]
    P -->|Editar produto| M1
    P -->|Registrar movimentação| M2[["Janela: movimentar estoque"]]
    M2 -->|Confirmar| P
    D -->|Movimentar estoque| M2
    D -->|Ver lista de reposição| RP["#reposicao"]
    RP -->|Registrar entrada| M2
    E --> MV["#movimentacoes"]
    MV -->|Nova movimentação| M2
```

### Produção

```mermaid
flowchart LR
    R["#receitas"] -->|Nova receita| F[["Janela: nova ficha técnica"]]
    F -->|Salvar ficha técnica| R
    R -->|Cartão da receita| FT["#receita/id<br/>Ficha técnica e capacidade"]
    D["#dashboard"] -->|Registrar produção| PR
    FT -->|Registrar produção| PR[["Janela: registrar produção<br/>revisão do consumo"]]
    PR -->|Quantidade acima da capacidade| BL["Aviso de estoque insuficiente<br/>confirmação bloqueada"]
    BL -->|Reduzir a quantidade| PR
    PR -->|Confirmar produção| OK["Produção registrada<br/>estoque e histórico atualizados"]
    OK --> MV["#movimentacoes"]
    OK --> RP["#reposicao"]
```

## Protótipo

Desenvolver um protótipo emerge como uma das maneiras mais ágeis e econômicas de validar uma ideia, conceito ou funcionalidade. Isso porque ele permite que o usuário interaja com a ideia antes dela ser implementada. Neste projeto, o protótipo passou a ser o próprio sistema: o front-end em React funciona em modo demonstração, sem login e com dados fictícios, e é a referência das telas abaixo.

> O protótipo no Figma está em atualização e será ajustado ao sistema implementado.

Como abrir a demonstração: acesse [https://istoque-front.onrender.com](https://istoque-front.onrender.com) e use o endereço com hash de qualquer tela (por exemplo, `#dashboard`), ou rode o front-end local (`npm run dev` em `codigo-fonte/Frontend/istoque`). Sem login, os dados são fictícios e a data é fixa em 26/09/2026. A lista completa de telas, rotas e requisitos está em [ux/telas/README.md](ux/telas/README.md), e as capturas foram feitas em 23/10/2026.

### Telas

Cada tela tem versão para computador (1440 px) e para celular (390 px); abaixo, as principais em desktop.

**Página inicial** (`#inicio`) — [versão para celular](ux/telas/mobile/01-inicio.png)

![Página inicial](ux/telas/desktop/01-inicio.png)

**Login** (`#login`) e **cadastro da empresa** (`#cadastro`)

![Login](ux/telas/desktop/02-login.png)

![Cadastro](ux/telas/desktop/03-cadastro.png)

**Visão geral** (`#dashboard`)

![Visão geral](ux/telas/desktop/04-dashboard.png)

**Estoque** (`#estoque`) e **detalhe do produto** (`#produto/tomate`)

![Estoque](ux/telas/desktop/05-estoque.png)

![Detalhe do produto](ux/telas/desktop/06-produto.png)

**Movimentações** (`#movimentacoes`)

![Movimentações](ux/telas/desktop/07-movimentacoes.png)

**Receitas** (`#receitas`) e **ficha técnica** (`#receita/burger`)

![Receitas](ux/telas/desktop/08-receitas.png)

![Ficha técnica](ux/telas/desktop/09-receita.png)

**Reposição** (`#reposicao`), **relatórios** (`#relatorios`), **equipe** (`#equipe`), **importar nota** (`#importacao`) e **mapa de fluxos** (`#fluxos`)

![Reposição](ux/telas/desktop/10-reposicao.png)

![Relatórios](ux/telas/desktop/11-relatorios.png)

![Equipe](ux/telas/desktop/12-equipe.png)

![Importar nota](ux/telas/desktop/13-importacao.png)

![Mapa de fluxos](ux/telas/desktop/14-fluxos.png)

**Janelas de operação:** novo produto, movimentar estoque, registrar produção (revisão e bloqueio por capacidade) e nova ficha técnica.

![Novo produto](ux/telas/desktop/15-novo-produto.png)

![Registrar movimentação](ux/telas/desktop/16-registrar-movimentacao.png)

![Produção, revisão do consumo](ux/telas/desktop/17-producao-revisao.png)

![Produção bloqueada por capacidade](ux/telas/desktop/18-producao-bloqueada.png)

![Nova ficha técnica](ux/telas/desktop/19-nova-ficha-tecnica.png)

### Telas no celular

No celular, o menu lateral vira uma gaveta e uma barra inferior dá acesso a visão geral, estoque, receitas, movimentações e relatórios.

| Visão geral | Estoque | Ficha técnica |
| --- | --- | --- |
| ![Visão geral no celular](ux/telas/mobile/04-dashboard.png) | ![Estoque no celular](ux/telas/mobile/05-estoque.png) | ![Ficha técnica no celular](ux/telas/mobile/09-receita.png) |
