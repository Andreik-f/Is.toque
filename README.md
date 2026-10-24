# IS.TOQUE

`ANÁLISE E DESENVOLVIMENTO DE SISTEMAS`

`Trabalho Interdisciplinar: Desenvolvimento de Aplicação Interativa`

`2º SEMESTRE DE 2026`

O IS.TOQUE é um sistema de gerenciamento de estoque para restaurantes e microempresas. A proposta é reunir o cadastro de produtos, o controle de entradas, saídas, perdas e descartes e o gerenciamento de receitas. Seu diferencial é calcular a capacidade de produção a partir dos insumos disponíveis e dar baixa nos ingredientes ao registrar uma produção.

Na etapa atual, o projeto possui frontend em React com Vite e backend em Java 21 com Spring Boot e PostgreSQL. O cadastro de empresa e administrador, o login e o cadastro e a consulta de produtos e categorias já estão integrados à API, assim como a consulta de unidades de medida. O repositório também possui testes automatizados e integração contínua com GitHub Actions.

As interfaces de movimentações, receitas, produção, relatórios e equipe estão disponíveis com operações em memória, ainda sem persistência pela API. As fotos dos produtos também permanecem apenas na interface, e a importação de notas fiscais utiliza dados simulados. A integração desses recursos e a proteção das rotas por autenticação e permissões continuam em desenvolvimento.

## Integrantes

* Amauri Luca Martinez Azevedo
* Andreik Fernandes Rocha
* David William da Silva Rocha
* Eduardo Rezende Machado

## Orientador

* Paulo Henrique Rodrigues

# Documentação

<ol>
<li><a href="documentação/01-Documentação de Contexto.md"> Documentação de Contexto</a></li>
<li><a href="documentação/02-Especificação do Projeto.md"> Especificação do Projeto</a></li>
<li><a href="documentação/03-Metodologia.md"> Metodologia</a></li>
<li><a href="documentação/04-Projeto de Interface.md"> Projeto de Interface</a></li>
<li><a href="documentação/05-Template padrão da Aplicação.md"> Template padrão da Aplicação</a></li>
<li><a href="documentação/06-Programação de Funcionalidades.md"> Programação de Funcionalidades</a></li>
<li><a href="documentação/07-Referências Bibliográficas.md"> Referências Bibliográficas</a></li>
<li><a href="documentação/08-Arquitetura da Solução.md"> Arquitetura da Solução</a></li>
</ol>

# Hospedagem

* Frontend (Render, site estático): [https://istoque-front.onrender.com](https://istoque-front.onrender.com).
* API de produção (Render, Docker): [https://is-toque-prod.onrender.com](https://is-toque-prod.onrender.com).
* O deploy é automático a partir do repositório `erezende544/is.toque_prod`, branch `Release`. A manutenção do ambiente de produção é acompanhada na [tarefa HT034](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/64).

# Código-Fonte

* <a href="codigo-fonte/README.md">Código Fonte</a>

# Apresentação

* <a href="documentação/apresentação/README.md">Apresentação do Projeto</a>
