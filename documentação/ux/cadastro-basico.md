# Acesso e cadastro básico — 28/09/2026

Implementação de demonstração em React + Vite. Base: [modelagem de dados do projeto](references/modelagem/modelagem-01-istoque.pdf), páginas 1 e 2, com cadastro básico em uma etapa.

| Tela | Campo de interface | Origem | Validação local |
| --- | --- | --- | --- |
| Login | E-mail do usuário | usuarios.email | Obrigatório; e-mail; até 150 caracteres |
| Login | Senha | Verificada contra usuarios.senha_hash pelo backend | Obrigatória |
| Cadastro | Razão social | empresas.razao_social | Obrigatória; até 150 caracteres; rejeitar somente espaços |
| Cadastro | Nome do responsável | usuarios.nome | Obrigatório; até 120 caracteres; rejeitar somente espaços |
| Cadastro | E-mail do usuário | usuarios.email | Obrigatório; e-mail; até 150 caracteres |
| Cadastro | Senha | Origina usuarios.senha_hash no servidor | Obrigatória |
| Cadastro | Confirmar senha | Somente interface | Obrigatória; igual à senha |

Nome fantasia, CNPJ, e-mail da empresa e telefone foram deixados para uma etapa posterior. Eles não têm marcação NN na modelagem. O e-mail informado agora pertence ao usuário, não ao contato da empresa.

IDs, vínculos empresa/perfil, status e datas devem ser definidos pelo backend. `dias_alerta_validade` é obrigatório no banco e precisa de um padrão de negócio ou configuração posterior; esta demonstração não escolhe silenciosamente um valor. Regras de senha, duplicidade de e-mail, criação do perfil inicial e contrato transacional de empresa/primeiro usuário dependem do backend. Não há campo `senha_hash` na interface.

## Construção visual

Em `src/features/auth/components/`, `auth-screen.jsx` e `access-form.jsx` compõem as telas e validam os formulários. `auth-controls.jsx` contém campos, botões, texto de apresentação e a curva decorativa. `auth.css` usa Grid/Flex e pontos de quebra: o painel tem largura máxima de 846 px e altura ajustada ao conteúdo; em telas estreitas, a composição muda e os textos não encolhem proporcionalmente à tela.

Apenas o mascote PNG e a textura JPG são imagens. Títulos, parágrafos, botões e campos são HTML real; nenhuma tela exportada é usada como fundo. A curva lateral é uma forma vetorial decorativa em código. As anotações “Desktop — 1440px” e “Mobile — 375px” foram removidas. A paleta permanece #164D4E, #F5B84F e #F9F6EF, com Poppins e Inter.

A reconstrução mantém a composição de referência, com ajustes de campos e responsividade. Não se aplica mais o relatório anterior de igualdade de pixels, que comparava uma camada SVG pronta. O resultado atual foi revisado visualmente e funcionalmente.

## Verificação e limites

Build de produção concluído. Login/cadastro demonstrativos, bloqueio de campos vazios, confirmação divergente com foco no campo, recuperação em modal e fechamento por Escape verificados. Sem erros JavaScript nem transbordamento horizontal em 320, 375, 390, 768, 1024, 1440 e 1920 px.

Submissões válidas abrem o dashboard de demonstração. Não há envio de credenciais, criação de conta, sessão real ou persistência. Os campos foram definidos pela modelagem de dados, não pelos DTOs do backend, e ainda precisam ser conferidos com a API.

## Padronização dos campos

Login e cadastro compartilham o componente AuthField: rótulo acima do controle que desaparece ao preencher e reaparece ao apagar, mantendo o espaço e o nome acessível; placeholder nativo que some durante a digitação; altura de 48 px, raio de 10 px, texto alinhado à esquerda, espaçamento uniforme e borda neutra. Senhas têm botão de mostrar/ocultar, sem submissão do formulário. Foco usa um único contorno no controle; o input não cria um segundo outline. Erros são ligados por aria-describedby e aparecem abaixo do campo correspondente; a submissão direciona o foco ao primeiro inválido. O preenchimento automático permanece habilitado. Sugestões de senha do navegador pertencem ao navegador, e não são uma imagem ou parte do layout.
