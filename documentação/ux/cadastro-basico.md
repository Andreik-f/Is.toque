# Acesso e cadastro básico — 28/09/2026

Implementação em React + Vite, ligada à API. Base: [modelagem de dados do projeto](references/modelagem/modelagem-01-istoque.pdf), páginas 1 e 2, com cadastro básico em uma etapa.

| Tela | Campo de interface | Origem | Validação local |
| --- | --- | --- | --- |
| Login | E-mail do usuário | usuario.email | Obrigatório; e-mail; até 150 caracteres |
| Login | Senha | Verificada contra usuario.senha_hash pelo backend | Obrigatória |
| Cadastro | Razão social | empresa.razao_social | Obrigatória; até 150 caracteres; rejeitar somente espaços |
| Cadastro | CNPJ | empresa.cnpj | Obrigatório; 14 caracteres, com ou sem máscara (aceita o CNPJ alfanumérico) |
| Cadastro | Nome do responsável | usuario.nome | Obrigatório; até 120 caracteres; rejeitar somente espaços |
| Cadastro | E-mail do usuário | usuario.email | Obrigatório; e-mail; até 150 caracteres |
| Cadastro | Senha | Origina usuario.senha_hash no servidor | Obrigatória; no mínimo 8 caracteres |
| Cadastro | Confirmar senha | Somente interface | Obrigatória; igual à senha |

Nome fantasia, e-mail da empresa e telefone foram deixados para uma etapa posterior. O CNPJ entrou no cadastro porque a API o exige (obrigatório e único). O e-mail informado pertence ao usuário, não ao contato da empresa, e é único no sistema: por isso o login não pede a empresa.

IDs, vínculos empresa/perfil, status e datas são definidos pelo backend. O cadastro usa `POST /api/auth/cadastro`, que cria a empresa, os perfis padrão e o administrador na mesma transação: se o e-mail ou o CNPJ já existirem, nada é gravado. O login usa `POST /api/auth/login`, com e-mail e senha. Não há campo `senha_hash` na interface.

## Construção visual

Em `src/features/auth/components/`, `auth-screen.jsx` e `access-form.jsx` compõem as telas e validam os formulários. `auth-controls.jsx` contém campos, botões, texto de apresentação e a curva decorativa. `auth.css` usa Grid/Flex e pontos de quebra: o painel tem largura máxima de 846 px e altura ajustada ao conteúdo; em telas estreitas, a composição muda e os textos não encolhem proporcionalmente à tela.

A textura do login é uma imagem JPG e a do cadastro é um SVG; o mascote é um SVG inline. Títulos, parágrafos, botões e campos são HTML real; nenhuma tela exportada é usada como fundo. A curva lateral é uma forma vetorial decorativa em código. As anotações “Desktop — 1440px” e “Mobile — 375px” foram removidas. A paleta permanece #164D4E, #F5B84F e #F9F6EF, com Poppins e Inter.

A reconstrução mantém a composição de referência, com ajustes de campos e responsividade. Não se aplica mais o relatório anterior de igualdade de pixels, que comparava uma camada SVG pronta. O resultado atual foi revisado visualmente e funcionalmente.

## Verificação e limites

Build de produção concluído. Bloqueio de campos vazios, confirmação divergente com foco no campo, recuperação em modal e fechamento por Escape verificados. Sem erros JavaScript nem transbordamento horizontal em 320, 375, 390, 768, 1024, 1440 e 1920 px.

Submissões válidas são enviadas à API (`POST /api/auth/login` e `POST /api/auth/cadastro`, com `LoginRequestDTO` e `CadastroRequestDTO`). O cadastro cria a empresa e o administrador e já abre o sistema; o login abre o sistema com os dados da empresa do usuário. Erros da API aparecem no campo correspondente ou acima do botão. A sessão fica guardada no navegador (`istoque.sessao`), com o token e o `expiraEm` devolvidos pela API; a API ainda não separa as empresas no servidor (HT002). A recuperação de senha continua simulada.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: o rótulo fica dentro do campo e, com foco ou texto, sobe e encolhe (só CSS, com `:placeholder-shown`, por isso o input leva `placeholder=" "`, e o rótulo faz o papel de dica); altura de 54 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado. Sugestões de senha do navegador pertencem ao navegador, e não são uma imagem ou parte do layout.
