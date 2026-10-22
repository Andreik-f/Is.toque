# ISTOQUE — front-end React + Vite

Interface de gestão de estoque para restaurantes. Com login, usa a API do backend (`codigo-fonte/Backend/istoque`). Sem login, funciona como demonstração, com dados fictícios em memória: recarregar reinicia a demonstração.

## Executar

```bash
npm ci
npm run dev
```

```bash
npm run build
npm run preview
npm test
```

Use uma versão recente do Node compatível com Vite 8 (a entrega foi validada em Node 24). As dependências estão fixadas em `package-lock.json`.

## Conectar à API

Em desenvolvimento, suba o backend na porta 8080 e rode `npm run dev`. O Vite repassa as chamadas a `/api` para `http://localhost:8080`, sem configuração extra. Para usar outra API (por exemplo, a publicada), crie um `.env.local` com `API_PROXY=https://endereco-da-api`.

No build de produção, o endereço da API vem da variável `VITE_API_URL`, lida no momento do build:

```bash
VITE_API_URL=https://endereco-da-api/api npm run build
```

A API só aceita chamadas do navegador vindas dos endereços listados na variável de ambiente `CORS_ORIGENS` do backend (separados por vírgula). Em produção, ela precisa conter o endereço do front publicado.

Com login, produtos, categorias e unidades de medida vêm da API e são gravados nela. Receitas, movimentações, produção, relatórios e equipe ainda não têm rota na API: com login, começam vazios, e o que se registra neles vale até recarregar a página. Nesses casos, a tela, o modal e a mensagem de confirmação avisam que o registro ainda não vai para o servidor; o mesmo vale para a foto do produto. A importação de nota continua só na demonstração. A API ainda não usa token (HT001) nem separa as empresas no servidor (HT002): a sessão guarda no navegador os dados do usuário logado, e o front envia o `empresaId` dele.

Com login, alertas de validade, relatórios e movimentações usam a data de hoje. Sem login, a demonstração usa a data fixa de 26/09/2026, a mesma dos dados de exemplo, e mostra o usuário fictício David Rocha.

## Organização

O código segue a estrutura por features ([bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)). O fluxo de dependências é num só sentido: código compartilhado → features → app. Uma feature não importa outra; quem junta as features são as telas em `app/`.

```
src/
├── main.jsx             → entrada da aplicação
├── styles/              → estilos (base, layout, componentes, telas e utilitários), reunidos em styles/index.css
├── app/                 → rotas (uma tela por arquivo), roteador, providers, modais e carga dos dados da empresa
├── components/          → componentes compartilhados (ui/ e layouts/)
├── config/              → rotas e menu, data de referência, empresa e usuário da demonstração
├── features/            → auth, products, stock, recipes, production, users, reports, imports (cada uma com api/ quando chama a API)
├── hooks/               → navegação por hash (#estoque, #produto/12...)
├── lib/                 → cliente HTTP da API e apoio às animações (com testes)
├── stores/              → sessão, estado das telas e da interface (modal e aviso)
├── testing/mocks/       → dados fictícios
└── utils/               → formatação, CSV, regras de estoque e expressão do mascote (com testes)
```

Imports usam o alias `@/` para `src/` (ex.: `@/components/ui/button.jsx`).

Os estilos ficam em `src/styles/`: `base/` (fontes, cores, tempos de animação, reset), `layout/` (menu lateral e barra do topo), `components/` (um arquivo por componente de `components/ui/`, mais painéis, filtros e avisos), `features/` (um arquivo por tela) e `utilities.css`. Cada arquivo traz as próprias regras de celular (`@media`). O `styles/index.css` importa todos numa ordem fixa, que deve ser mantida: regras com a mesma especificidade valem pela posição. A tela de acesso tem o próprio `auth.css`, em `features/auth/components/`.

Animações do menu e dos estados: só `transform`, `opacity` e as propriedades individuais `translate`, `scale` e `rotate`, de 100 a 260 ms, com os tempos e curvas de `tokens.css`; o "reduzir movimento" do `utilities.css` zera tudo (a aba e a bolha pulam direto). No menu lateral, a aba ativa é um único elemento (`nav-indicator`) que desliza até o item, medido em `sidebar.jsx`; o hover usa fade num `::before`; o círculo âmbar, o contador de estoque baixo, o título da barra do topo e o sino só animam quando o valor muda, nunca ao abrir (`hooks/use-change-count.js`); os itens entram em sequência ao abrir. No celular, o menu abre em 250 ms e fecha em 200 ms, o fundo escuro (`scrim`) fica sempre montado e some com `visibility` (sem clique nem foco quando fechado), e a bolha da barra de baixo desliza por `translate` calculado em CSS (`--idx` e `--n`). O conteúdo de cada rota entra com fade (`.route-enter`, com `key` por rota). O mascote aparece no logo (balança no hover), na tela de carregamento (`mode="espera"`, com a tampa subindo) e na lista de produtos vazia (`mascot` do `Empty`, `mode="vazio"`).

Rotas de revisão: `#dashboard`, `#estoque`, `#produto/<id>` (ex.: `#produto/tomate`), `#movimentacoes`, `#receitas`, `#receita/<id>` (ex.: `#receita/burger`), `#reposicao`, `#relatorios`, `#equipe`, `#importacao`, `#fluxos`, `#login`, `#cadastro`, `#recuperar`. O id fica na URL, então recarregar a página ou usar o botão Voltar mantém o mesmo produto ou receita; sem id, `#produto` e `#receita` abrem o último item aberto. O `#fluxos` (mapa de fluxos do protótipo) só aparece no menu da demonstração.

A importação usa uma nota fictícia; não há upload nem processamento de notas. As fontes Inter e Poppins são distribuídas com suas licenças OFL em `public/fonts/`.

O guia funcional completo, o mapa de fluxos e as capturas das telas estão em `documentação/ux/`, na raiz do repositório.

## Foto de produto (RF-34)

O cadastro e a edição aceitam uma foto opcional JPEG/JPG, PNG ou WebP até 5 MB. `features/products/components/product-photo-field.jsx` contém o campo com prévia, validação, troca/remoção e a apresentação com imagem padrão. O arquivo é lido localmente e guardado no estado do produto. Cancelar descarta alterações; salvar preserva o saldo. Persistência e validação no servidor continuam pendentes de integração: com login, o campo avisa que a foto vale até recarregar a página.

## Acesso e cadastro básico

Login: e-mail do usuário e senha. Cadastro: razão social, CNPJ, nome do responsável, e-mail, senha e confirmação. Os campos seguem a modelagem de dados e o contrato da API (`POST /api/auth/login` e `POST /api/auth/cadastro`), e as regras de validação ficam em `features/auth/utils/validation.js`; confirmação serve somente à interface. Nome fantasia, telefone e contato da empresa ficaram para uma etapa posterior do cadastro.

Em `features/auth/components/`, `auth-screen.jsx` compõe a tela, `access-form.jsx` tem o formulário, `auth-controls.jsx` reúne controles reutilizáveis e `auth.css` define o layout responsivo. As imagens da tela são `textura.jpg` (textura com linhas contínuas, 1920×1279 px) e `textura-cadastro.svg` (arte vertical do painel do cadastro), em `features/auth/assets/`; o mascote é um SVG inline (`components/ui/mascot.jsx`); textos, campos e botões são HTML.

A interface segue a paleta e a composição do Figma. No computador, o cartão tem até 846 px de largura e cresce conforme os campos e os erros; no celular, o layout se reorganiza. A curva lateral é vetorial e decorativa.

A validação verifica obrigatoriedade, e-mail, CNPJ, tamanho mínimo e igualdade das senhas antes de enviar. O login chama `POST /api/auth/login`; o cadastro chama `POST /api/auth/cadastro`, que cria a empresa e o administrador, e já entra no sistema. Erros da API aparecem no campo correspondente ou acima do botão. A sessão fica em `stores/session-store.jsx`, e "Sair", no menu lateral, a encerra.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: o rótulo fica dentro do campo e, com foco ou texto, sobe e encolhe (só CSS, com `:placeholder-shown`, por isso o input leva `placeholder=" "`, e o rótulo faz o papel de dica); altura de 54 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado.
