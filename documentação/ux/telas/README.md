# Telas do sistema

As imagens abaixo são capturas do próprio Is.toque, no modo demonstração (sem login), e substituem o protótipo HTML anterior.

- **Data da captura:** 23/10/2026.
- **Commit:** `3c88e11` (branch `feat/landing-page`).
- **Dados:** fictícios e fixos; a demonstração usa a data de 26/09/2026.
- **Como foram feitas:** front-end rodando com `npm run dev`, navegador Chromium com o armazenamento limpo e animações reduzidas, página inteira. Desktop com 1440 px de largura e celular com 390 px.

## Telas

| Tela | Rota | Requisitos | Desktop | Celular |
| --- | --- | --- | --- | --- |
| Página inicial | `#inicio` | Apresentação do sistema (sem RF específico) | [desktop](desktop/01-inicio.png) | [celular](mobile/01-inicio.png) |
| Login | `#login` | RF-03 | [desktop](desktop/02-login.png) | [celular](mobile/02-login.png) |
| Cadastro da empresa | `#cadastro` | RF-01, RF-02 | [desktop](desktop/03-cadastro.png) | [celular](mobile/03-cadastro.png) |
| Visão geral | `#dashboard` | RF-17, RF-19, RF-22, RF-30 | [desktop](desktop/04-dashboard.png) | [celular](mobile/04-dashboard.png) |
| Estoque | `#estoque` | RF-07, RF-08, RF-10, RF-17, RF-19, RF-36 | [desktop](desktop/05-estoque.png) | [celular](mobile/05-estoque.png) |
| Detalhe do produto | `#produto/tomate` | RF-08, RF-09, RF-13, RF-15, RF-19 | [desktop](desktop/06-produto.png) | [celular](mobile/06-produto.png) |
| Movimentações | `#movimentacoes` | RF-11, RF-12, RF-15, RF-16, RF-18, RF-31 | [desktop](desktop/07-movimentacoes.png) | [celular](mobile/07-movimentacoes.png) |
| Receitas | `#receitas` | RF-20, RF-22, RF-38 | [desktop](desktop/08-receitas.png) | [celular](mobile/08-receitas.png) |
| Ficha técnica | `#receita/burger` | RF-21, RF-22, RF-23, RF-24 | [desktop](desktop/09-receita.png) | [celular](mobile/09-receita.png) |
| Reposição | `#reposicao` | RF-17, RF-33 | [desktop](desktop/10-reposicao.png) | [celular](mobile/10-reposicao.png) |
| Relatórios | `#relatorios` | RF-32 | [desktop](desktop/11-relatorios.png) | [celular](mobile/11-relatorios.png) |
| Equipe | `#equipe` | RF-04, RF-05 | [desktop](desktop/12-equipe.png) | [celular](mobile/12-equipe.png) |
| Importar nota | `#importacao` | Extensão proposta (simulada) | [desktop](desktop/13-importacao.png) | [celular](mobile/13-importacao.png) |
| Mapa de fluxos | `#fluxos` | Apoio à navegação (sem RF específico) | [desktop](desktop/14-fluxos.png) | [celular](mobile/14-fluxos.png) |

## Telas com janela (somente desktop)

| Tela | Aberta em | Requisitos | Imagem |
| --- | --- | --- | --- |
| Novo produto | `#estoque`, botão "Novo produto" | RF-07, RF-09, RF-10, RF-34, RF-36 | [desktop](desktop/15-novo-produto.png) |
| Registrar movimentação | `#movimentacoes`, botão "Nova movimentação" | RF-11, RF-12, RF-14, RF-16, RF-18 | [desktop](desktop/16-registrar-movimentacao.png) |
| Produção, revisão do consumo | `#receita/burger`, botão "Registrar produção" | RF-24, RF-25, RF-26, RF-28 | [desktop](desktop/17-producao-revisao.png) |
| Produção bloqueada por capacidade | mesma janela, com 13 porções (capacidade 12) | RF-27 | [desktop](desktop/18-producao-bloqueada.png) |
| Nova ficha técnica | `#receitas`, botão "Nova receita" | RF-20, RF-21 | [desktop](desktop/19-nova-ficha-tecnica.png) |

A recuperação de senha (`#recuperar`) existe como simulação e não foi capturada. Os requisitos estão descritos em [02-Especificação do Projeto](../../02-Especificação%20do%20Projeto.md).
