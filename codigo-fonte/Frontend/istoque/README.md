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

Com login, produtos, categorias e unidades de medida vêm da API e são gravados nela. Receitas, movimentações, produção, relatórios e equipe ainda não têm rota na API: com login, começam vazios, e o que se registra neles vale até recarregar a página (a tela avisa). A importação de nota continua só na demonstração. A API ainda não usa token (HT001) nem separa as empresas no servidor (HT002): a sessão guarda no navegador os dados do usuário logado, e o front envia o `empresaId` dele.

## Organização

O código segue a estrutura por features ([bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)). O fluxo de dependências é num só sentido: código compartilhado → features → app. Uma feature não importa outra; quem junta as features são as telas em `app/`.

```
src/
├── main.jsx, index.css  → entrada da aplicação e estilos globais
├── app/                 → rotas (uma tela por arquivo), roteador, providers, modais e carga dos dados da empresa
├── components/          → componentes compartilhados (ui/ e layouts/)
├── config/              → rotas do menu e data de referência da demonstração
├── features/            → auth, products, stock, recipes, production, users, reports, imports (cada uma com api/ quando chama a API)
├── hooks/               → navegação por hash (#estoque, #receitas...)
├── lib/                 → cliente HTTP da API (com testes)
├── stores/              → sessão, estado das telas e da interface (modal e aviso)
├── testing/mocks/       → dados fictícios
└── utils/               → formatação, CSV e regras de estoque (com testes)
```

Imports usam o alias `@/` para `src/` (ex.: `@/components/ui/button.jsx`).

Rotas de revisão: `#dashboard`, `#estoque`, `#produto`, `#movimentacoes`, `#receitas`, `#receita`, `#reposicao`, `#relatorios`, `#equipe`, `#importacao`, `#fluxos`, `#login`, `#cadastro`, `#recuperar`.

A importação usa uma nota fictícia; não há upload nem processamento de notas. As fontes Inter e Poppins são distribuídas com suas licenças OFL em `public/fonts/`.

O guia funcional completo, o mapa de fluxos e as capturas das telas estão em `documentação/ux/`, na raiz do repositório.

## Foto de produto (RF-34)

O cadastro e a edição aceitam uma foto opcional JPEG/JPG, PNG ou WebP até 5 MB. `features/products/components/product-photo-field.jsx` contém o campo com prévia, validação, troca/remoção e a apresentação com imagem padrão. O arquivo é lido localmente e guardado no estado do produto. Cancelar descarta alterações; salvar preserva o saldo. Persistência e validação no servidor continuam pendentes de integração.

## Acesso e cadastro básico

Login: e-mail do usuário e senha. Cadastro: razão social, CNPJ, nome do responsável, e-mail, senha e confirmação. Os campos seguem a modelagem de dados e o contrato da API (`POST /api/auth/login` e `POST /api/auth/cadastro`), e as regras de validação ficam em `features/auth/utils/validation.js`; confirmação serve somente à interface. Nome fantasia, telefone e contato da empresa ficaram para uma etapa posterior do cadastro.

Em `features/auth/components/`, `auth-screen.jsx` compõe a tela, `access-form.jsx` tem o formulário, `auth-controls.jsx` reúne controles reutilizáveis e `auth.css` define o layout responsivo. Os únicos ativos de imagem são `mascote.png` e `textura.jpg`, as imagens originais do projeto. Não há telas inteiras embutidas como fundo. Textos e botões são HTML. As anotações de dimensão foram removidas.

A interface preserva a paleta e composição do Figma. O painel desktop tem largura máxima de 846 px e cresce conforme os campos e erros; o layout se reorganiza no celular, sem reduzir a tipografia por escala global. A curva lateral é vetorial e decorativa.

A validação verifica obrigatoriedade, e-mail, CNPJ, tamanho mínimo e igualdade das senhas antes de enviar. O login chama `POST /api/auth/login`; o cadastro chama `POST /api/auth/cadastro`, que cria a empresa e o administrador, e já entra no sistema. Erros da API aparecem no campo correspondente ou acima do botão. A sessão fica em `stores/session-store.jsx`, e "Sair", no menu lateral, a encerra.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: rótulo acima do controle que desaparece ao preencher e reaparece ao apagar, mantendo o espaço e o nome acessível; placeholder nativo que some durante a digitação; altura de 48 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado. Sugestões de senha do navegador pertencem ao navegador, e não são uma imagem ou parte do layout.
