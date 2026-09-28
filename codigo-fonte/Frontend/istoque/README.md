# ISTOQUE — protótipo React + Vite

Proposta de UI para gestão de estoque de restaurantes. Dados fictícios em memória; recarregar reinicia a demonstração.

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

## Organização

O código segue a estrutura por features ([bulletproof-react](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)). O fluxo de dependências é num só sentido: código compartilhado → features → app. Uma feature não importa outra; quem junta as features são as telas em `app/`.

```
src/
├── main.jsx, index.css  → entrada da aplicação e estilos globais
├── app/                 → rotas (uma tela por arquivo), roteador, providers e modais
├── components/          → componentes compartilhados (ui/ e layouts/)
├── config/              → rotas do menu e data de referência da demonstração
├── features/            → auth, products, stock, recipes, production, users, reports, imports
├── hooks/               → navegação por hash (#estoque, #receitas...)
├── stores/              → estado da demonstração e da interface (modal e aviso)
├── testing/mocks/       → dados fictícios
└── utils/               → formatação, CSV e regras de estoque (com testes)
```

Imports usam o alias `@/` para `src/` (ex.: `@/components/ui/button.jsx`).

Rotas de revisão: `#dashboard`, `#estoque`, `#produto`, `#movimentacoes`, `#receitas`, `#receita`, `#reposicao`, `#relatorios`, `#equipe`, `#importacao`, `#fluxos`, `#login`, `#cadastro`, `#recuperar`.

Este projeto não contém autenticação real, isolamento multiempresa, banco de dados nem upload/processamento de notas. A importação usa uma nota fictícia. Não coloque credenciais reais no protótipo. As fontes Inter e Poppins são distribuídas com suas licenças OFL em `public/fonts/`.

O guia funcional completo, o mapa de fluxos e as capturas das telas estão em `documentação/ux/`, na raiz do repositório.

## Foto de produto (RF-34)

O cadastro e a edição aceitam uma foto opcional JPEG/JPG, PNG ou WebP até 5 MB. `features/products/components/product-photo-field.jsx` contém o campo com prévia, validação, troca/remoção e a apresentação com imagem padrão. O arquivo é lido localmente e guardado no estado do produto. Cancelar descarta alterações; salvar preserva o saldo. Persistência e validação no servidor continuam pendentes de integração.

## Acesso e cadastro básico

Login: e-mail do usuário e senha. Cadastro: razão social, nome do responsável, e-mail, senha e confirmação. Campos definidos pela modelagem de dados do projeto; confirmação serve somente à interface. CNPJ, nome fantasia, telefone e contato da empresa ficaram para uma etapa posterior do cadastro.

Em `features/auth/components/`, `auth-screen.jsx` compõe a tela, `access-form.jsx` tem o formulário, `auth-controls.jsx` reúne controles reutilizáveis e `auth.css` define o layout responsivo. Os únicos ativos de imagem são `mascote.png` e `textura.jpg`, as imagens originais do projeto. Não há telas inteiras embutidas como fundo. Textos e botões são HTML. As anotações de dimensão foram removidas.

A interface preserva a paleta e composição do Figma. O painel desktop tem largura máxima de 846 px e cresce conforme os campos e erros; o layout se reorganiza no celular, sem reduzir a tipografia por escala global. A curva lateral é vetorial e decorativa.

A validação verifica obrigatoriedade, e-mail e igualdade das senhas. Senha não é persistida. Submissões válidas só abrem o dashboard demonstrativo. Contratos da API, política de senha, perfil inicial, padrão de dias de alerta, sessão e gravação permanecem pendentes da integração com o backend.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: rótulo acima do controle que desaparece ao preencher e reaparece ao apagar, mantendo o espaço e o nome acessível; placeholder nativo que some durante a digitação; altura de 48 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado. Sugestões de senha do navegador pertencem ao navegador, e não são uma imagem ou parte do layout.
