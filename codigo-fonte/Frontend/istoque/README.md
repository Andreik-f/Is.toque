# ISTOQUE — front-end React + Vite

Interface de gestão de estoque para restaurantes. Com login, usa a API do backend (`codigo-fonte/Backend/istoque`). Sem login, funciona como demonstração, com dados fictícios em memória: recarregar reinicia a demonstração.

O endereço sem hash abre a página inicial de apresentação (`#inicio`) para quem não tem sessão e o painel para quem já entrou. A demonstração continua em `#dashboard`.

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

Em desenvolvimento, suba o backend na porta 8080 e rode `npm run dev`. O Vite repassa as chamadas a `/api` para `http://localhost:8080`, sem configuração extra. Para usar outra API (por exemplo, a publicada), crie um `.env.local` com `API_PROXY=https://is-toque-prod.onrender.com`.

No build de produção, o endereço da API vem da variável `VITE_API_URL`, lida no momento do build:

```bash
VITE_API_URL=https://is-toque-prod.onrender.com/api npm run build
```

A API só aceita chamadas do navegador vindas dos endereços listados na variável de ambiente `CORS_ORIGENS` do backend (separados por vírgula). Em produção, ela precisa conter o endereço do front publicado, `https://istoque-front.onrender.com`.

No Render gratuito a API dorme e o primeiro acesso espera ela acordar: a tela de login consulta `/actuator/health` (a base de `VITE_API_URL` sem o `/api`) a cada 3 segundos, por até 90, e mostra "Acordando o servidor…" se a API demorar mais de 2. O backend libera o CORS desse caminho para as origens de `CORS_ORIGENS`. Em desenvolvimento (proxy do Vite) isso não acontece.

Com login, produtos, categorias e unidades de medida vêm da API e são gravados nela. Receitas, movimentações, produção, relatórios e equipe ainda não têm rota na API: com login, começam vazios, e o que se registra neles vale até recarregar a página. Nesses casos, a tela, o modal e a mensagem de confirmação avisam que o registro ainda não vai para o servidor; o mesmo vale para a foto do produto. A importação de nota continua só na demonstração. A API separa os dados por empresa a partir do token (HT002): o front não envia `empresaId` nas chamadas de produtos, categorias e unidades. A sessão guarda no navegador os dados do usuário, o `token` e o `expiraEm`, e o cliente HTTP envia `Authorization: Bearer <token>` em todas as chamadas, menos no login e no cadastro.

Com login, alertas de validade, relatórios e movimentações usam a data de hoje. Sem login, a demonstração usa a data fixa de 26/09/2026, a mesma dos dados de exemplo, e mostra o usuário fictício David Rocha.

## Acesso à API por funcionalidade

As chamadas à API ficam organizadas por funcionalidade em `src/features/<nome>/api/` (como `src/features/products/api/products.js`), consumindo a instância do cliente HTTP definida em `src/lib/api-client.js`.

### Hook `useApiData` e controlador

O hook `useApiData(fetcher, { enabled = true, deps = [] })` gerencia o carregamento de dados e retorna `{ data, loading, error, reload }`:
- `fetcher`: função assíncrona `() => Promise` responsável por buscar os dados;
- Execução: dispara a busca ao montar o componente e sempre que `enabled` ou qualquer dependência em `deps` sofrer alteração;
- `enabled: false`: não executa o `fetcher` e retorna `data: null`, `loading: false` e `error: ""`;
- `loading`: permanece `true` durante a primeira busca e em chamadas de `reload`;
- `data`: durante o `reload`, os dados da consulta anterior são preservados em `data` até a chegada da nova resposta;
- `error`: recebe a mensagem de erro já formatada (`errorMessage`) em falhas ou `""` em caso de sucesso;
- Concorrência e descarte: a lógica é controlada por `createApiDataController` em `src/lib/api-data-controller.js`. Apenas a resposta da busca mais recente é considerada; respostas de requisições anteriores ou de componentes desmontados são ignoradas e descartadas.
- Criação: `createApiDataSource(fetcher, { enabled })`, em `src/lib/api-data-controller.js`, devolve o controlador; com `enabled: false` devolve um controlador inerte que não chama o `fetcher`. O hook cria o controlador dentro do `useEffect` (com `dispose` no cleanup), então funciona sob StrictMode.

### Apresentação com `DataState`

O componente `DataState` padroniza os estados de carregamento e falha a partir das props `loading`, `error`, `onRetry`, `loadingText`, `errorTitle`, `extraActions` e `children`:
- Carregamento: exibe a mensagem de `loadingText` acompanhada do mascote animado em modo de espera;
- Erro: exibe a mensagem de erro com o título `errorTitle` (por padrão, "Não foi possível carregar os dados"), o botão "Tentar de novo" vinculado a `onRetry` e os botões adicionais informados em `extraActions`;
- Sucesso: renderiza `children` quando não há carregamento pendente nem erro.

### Atualização pós-gravação e mesclagem de dados

Após operações de escrita na API, a aplicação não recalcula a lista localmente: invoca `reload()` para obter o estado atualizado do servidor, conforme executado por `persist.saveProduct` e `persist.createCategory` em `src/app/company-data.jsx`.
Ao receber os dados atualizados em `initial`, o `DemoStoreProvider` utiliza `mergeLoadedProducts` (`src/features/products/utils/product-merge.js`) para mesclar pelo identificador (`id`) os campos de saldo (`stock`), validade (`expiry`), foto (`photo`) e ilustração (`art`) que já estavam na tela, visto que a API ainda não persiste essas informações. Se o `reload()` falhar com dados já na tela, a tela continua montada (nada do que está só na memória se perde) e `CompanyData` mostra o erro num aviso (`notify` do `ui-store`).

### Demonstração sem login

Sem login, não há chamadas à API: `CompanyDataProvider` em `src/app/company-data.jsx` verifica a inexistência de sessão e monta diretamente o `DemoStoreProvider` com dados fictícios (`DEMO_DATA`). O componente `CompanyData` nem chega a ser instanciado. Portanto, a opção `enabled: false` do `useApiData`, embora implementada no hook e no controlador, não é utilizada no aplicativo.

### Exemplo de integração

Exemplo extraído de `src/app/company-data.jsx` demonstrando a composição entre `useApiData` e `DataState` (o cálculo de `initial` com `useMemo` e a definição de `persist` foram omitidos):

```jsx
function CompanyData({ session, children }) {
  const { signOut } = useSession();

  const { data, loading, error, reload } = useApiData(
    () => Promise.all([getProducts(), getCategories(), getUnits()])
      .then(([products, categories, units]) => ({
        products: products.map(productFromApi),
        categories,
        units,
      })),
    { deps: [session] },
  );

  return (
    <DataState
      loading={loading && !data}
      error={data ? "" : error}
      onRetry={reload}
      loadingText={`Carregando os dados de ${session.nomeEmpresa}...`}
      extraActions={
        <Button variant="secondary" onClick={() => { signOut(); navigate("login"); }}>
          Sair
        </Button>
      }
    >
      {data && (
        <DemoStoreProvider initial={initial} persist={persist}>
          {children}
        </DemoStoreProvider>
      )}
    </DataState>
  );
}
```

## Organização

O código segue a estrutura por features ([bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)). O fluxo de dependências é num só sentido: código compartilhado → features → app. Uma feature não importa outra; quem junta as features são as telas em `app/`.

```
src/
├── main.jsx             → entrada da aplicação
├── styles/              → estilos (base, layout, componentes, telas e utilitários), reunidos em styles/index.css
├── app/                 → rotas (uma tela por arquivo), roteador, providers, modais e carga dos dados da empresa
├── components/          → componentes compartilhados (ui/ e layouts/)
├── config/              → rotas e menu, data de referência, empresa e usuário da demonstração
├── features/            → auth, products, stock, recipes, production, users, reports, imports, landing (cada uma com api/ quando chama a API)
├── hooks/               → navegação por hash (#estoque, #produto/12...) e useApiData
├── lib/                 → cliente HTTP da API, controlador do useApiData e apoio às animações (com testes)
├── stores/              → sessão, estado das telas e da interface (modal e aviso)
├── testing/mocks/       → dados fictícios
└── utils/               → formatação, CSV, regras de estoque e expressão do mascote (com testes)
```

Imports usam o alias `@/` para `src/` (ex.: `@/components/ui/button.jsx`).

Os estilos ficam em `src/styles/`: `base/` (fontes, cores, tempos de animação, reset), `layout/` (menu lateral e barra do topo), `components/` (um arquivo por componente de `components/ui/`, mais painéis, filtros e avisos), `features/` (um arquivo por tela) e `utilities.css`. Cada arquivo traz as próprias regras de celular (`@media`). O `styles/index.css` importa todos numa ordem fixa, que deve ser mantida: regras com a mesma especificidade valem pela posição. A tela de acesso tem o próprio `auth.css`, em `features/auth/components/`.

Animações do menu e dos estados: só `transform`, `opacity` e as propriedades individuais `translate`, `scale` e `rotate`, de 100 a 260 ms, com os tempos e curvas de `tokens.css`; o "reduzir movimento" do `utilities.css` zera tudo (a aba e a bolha pulam direto). No menu lateral, a aba ativa é um único elemento (`nav-indicator`) que desliza até o item, medido em `sidebar.jsx`; o hover usa fade num `::before`; o círculo âmbar, o contador de estoque baixo, o título da barra do topo e o sino só animam quando o valor muda, nunca ao abrir (`hooks/use-change-count.js`); os itens entram em sequência ao abrir. No celular, o menu abre em 250 ms e fecha em 200 ms, o fundo escuro (`scrim`) fica sempre montado e some com `visibility` (sem clique nem foco quando fechado), e a bolha da barra de baixo desliza por `translate` calculado em CSS (`--idx` e `--n`). O conteúdo de cada rota entra com fade (`.route-enter`, com `key` por rota). O mascote aparece no logo (balança no hover), na tela de carregamento (`mode="espera"`, com a tampa subindo) e na lista de produtos vazia (`mascot` do `Empty`, `mode="vazio"`).

Rotas de revisão: `#inicio`, `#dashboard`, `#estoque`, `#produto/<id>` (ex.: `#produto/tomate`), `#movimentacoes`, `#receitas`, `#receita/<id>` (ex.: `#receita/burger`), `#reposicao`, `#relatorios`, `#equipe`, `#empresa`, `#importacao`, `#fluxos`, `#login`, `#cadastro`, `#recuperar`. O id fica na URL, então recarregar a página ou usar o botão Voltar mantém o mesmo produto ou receita; sem id, `#produto` e `#receita` abrem o último item aberto. O `#fluxos` (mapa de fluxos do protótipo) só aparece no menu da demonstração.

## Página inicial

`features/landing/` monta a apresentação do produto (`#inicio`), carregada à parte (`React.lazy`) para não pesar no sistema. O estilo fica em `styles/features/landing.css`, todo sob `.landing`, e as capturas de tela em `public/landing/` (referenciadas por URL, para não virarem base64 no pacote). O painel do topo simula um dia de cozinha a cada 2,8 s com a lógica de `utils/simulation.js` (com testes) e para fora da tela. Os efeitos de rolagem usam `animation-timeline` só onde o navegador suporta; sem suporte, ou com "reduzir movimento", a página fica no estado final, parada. Os links "Como funciona" e "Perguntas" rolam sem mudar o hash, que o roteador leria como rota.

A importação usa uma nota fictícia; não há upload nem processamento de notas. As fontes Inter e Poppins são distribuídas com suas licenças OFL em `public/fonts/`.

O guia funcional completo, o mapa de fluxos e as capturas das telas estão em `documentação/ux/`, na raiz do repositório.

## Foto de produto (RF-34)

O cadastro e a edição aceitam uma foto opcional JPEG/JPG, PNG ou WebP até 5 MB. `features/products/components/product-photo-field.jsx` contém o campo com prévia, validação, troca/remoção e a apresentação com imagem padrão. O arquivo é lido localmente e guardado no estado do produto. Cancelar descarta alterações; salvar preserva o saldo. Persistência e validação no servidor continuam pendentes de integração: com login, o campo avisa que a foto vale até recarregar a página.

## Acesso e cadastro básico

Login: e-mail do usuário e senha. Cadastro: razão social, CNPJ, nome do responsável, e-mail, senha e confirmação. Os campos seguem a modelagem de dados e o contrato da API (`POST /api/auth/login` e `POST /api/auth/cadastro`), e as regras de validação ficam em `features/auth/utils/validation.js`; confirmação serve somente à interface. O telefone da empresa é opcional no cadastro (máscara em `utils/phone.js`) e nunca dispara SMS; nome fantasia e contato da empresa ficaram para uma etapa posterior. A confirmação do telefone por SMS fica em `#empresa` (`features/company/`), só para quem tem a permissão `empresa.configurar`: salvar o telefone, pedir o código (6 dígitos, novo pedido só depois de 60 s, com a contagem na tela e a mensagem de bloqueio no 429) e confirmar. Enquanto o telefone não está confirmado, o administrador vê um aviso na tela e no painel. O link "Configurações" do menu só aparece com a permissão, que vem na sessão do login.

Em `features/auth/components/`, `auth-screen.jsx` compõe a tela, `access-form.jsx` tem o formulário, `auth-controls.jsx` reúne controles reutilizáveis e `auth.css` define o layout responsivo. As imagens da tela são `textura.jpg` (textura com linhas contínuas, 1920×1279 px) e `textura-cadastro.svg` (arte vertical do painel do cadastro), em `features/auth/assets/`; o mascote é um SVG inline (`components/ui/mascot.jsx`); textos, campos e botões são HTML.

A interface segue a paleta e a composição do Figma. No computador, o cartão tem até 846 px de largura e cresce conforme os campos e os erros; no celular, o layout se reorganiza. A curva lateral é vetorial e decorativa.

A validação verifica obrigatoriedade, e-mail, CNPJ, tamanho mínimo e igualdade das senhas antes de enviar. O login chama `POST /api/auth/login`; o cadastro chama `POST /api/auth/cadastro`, que cria a empresa e o administrador, e já entra no sistema. Erros da API aparecem no campo correspondente ou acima do botão. A sessão fica em `stores/session-store.jsx`, e "Sair", no menu lateral, a encerra e apaga o token. Recarregar a página com o token ainda válido mantém o usuário logado. Uma resposta 401 em qualquer chamada autenticada, ou um token já vencido ao abrir o sistema (`expiraEm`), encerra a sessão e abre `#login` com o aviso "Sua sessão expirou. Entre novamente."; no vencido, nenhum dado é carregado. Um 401 do próprio login ou cadastro significa credencial incorreta e não encerra sessão.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: o rótulo fica dentro do campo e, com foco ou texto, sobe e encolhe (só CSS, com `:placeholder-shown`, por isso o input leva `placeholder=" "`, e o rótulo faz o papel de dica); altura de 54 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado.
