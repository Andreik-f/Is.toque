# Instruções de utilização

O Is.toque tem duas aplicações, que ficam em pastas separadas e se comunicam por HTTP:

| Aplicação | Pasta | Tecnologias | Documentação |
| --- | --- | --- | --- |
| Backend (API REST) | [Backend/istoque](Backend/istoque) | Java 21, Spring Boot 4, Maven, PostgreSQL, Flyway | [README do backend](Backend/istoque/README.md) |
| Frontend (interface web) | [Frontend/istoque](Frontend/istoque) | React, Vite, Node.js | [README do frontend](Frontend/istoque/README.md) |

O banco de dados é um PostgreSQL hospedado no Neon. O `application.properties` do backend já aponta para o banco de desenvolvimento da equipe, então a API sobe sem configuração extra.

## Endereços publicados

- Frontend: [https://istoque-front.onrender.com](https://istoque-front.onrender.com)
- API: [https://is-toque-prod.onrender.com](https://is-toque-prod.onrender.com)

## Como rodar

### Backend

Precisa do JDK 21. O Maven vem junto no projeto (`mvnw`).

```powershell
cd codigo-fonte\Backend\istoque
.\mvnw.cmd spring-boot:run   # API em http://localhost:8080
```

Em Linux, macOS ou Git Bash, use `./mvnw spring-boot:run`. Para conferir a conexão com o banco, acesse http://localhost:8080/actuator/health.

### Frontend

Precisa de uma versão recente do Node compatível com Vite 8 (a entrega foi validada em Node 24).

```powershell
cd codigo-fonte\Frontend\istoque
npm ci
npm run dev                  # interface em http://localhost:5173
```

Sem login, o frontend funciona como demonstração, com dados fictícios em memória. Com login, ele usa a API: em desenvolvimento, o Vite repassa as chamadas de `/api` para `http://localhost:8080`.

## Variáveis de ambiente

| Variável | Onde | Para que serve | Valor padrão |
| --- | --- | --- | --- |
| `CORS_ORIGENS` | Backend | Endereços do frontend que podem chamar a API pelo navegador, separados por vírgula. Em produção, deve conter o endereço do frontend publicado. | `http://localhost:5173,http://localhost:4173` |
| `VITE_API_URL` | Frontend (lida no momento do build) | Endereço da API no build de produção, por exemplo `https://endereco-da-api/api`. | `/api` |
| `API_PROXY` | Frontend (desenvolvimento e `preview`) | Endereço para onde o Vite repassa as chamadas de `/api`. Pode ser definida em um `.env.local`. | `http://localhost:8080` |

## Como rodar os testes

```powershell
# backend: testes de integração e unitários, com banco H2 em memória (não tocam no Neon)
cd codigo-fonte\Backend\istoque
.\mvnw.cmd test

# frontend: testes unitários com o executor nativo do Node, e build de produção
cd codigo-fonte\Frontend\istoque
npm test
npm run build
```

O workflow `.github/workflows/ci.yml` roda esses mesmos passos a cada push e pull request na `main`: `./mvnw test` com Java 21, e `npm ci`, `npm test` e `npm run build` com Node 24.

## Deploy

A publicação é automática a partir do repositório `erezende544/is.toque_prod`, branch `Release`, no Render:

- **Frontend:** site estático no Render.
- **Backend:** serviço no Render, executado em Docker, conectado ao banco de produção no Neon.

O acompanhamento da publicação está na tarefa [HT034](https://github.com/ICEI-PUC-Minas-PBR-ADS/pbr-ads-2026-2-p1-tidai-t1-8246101-pbr-ads-2026-2-p1-tidai-t-davidwsr1/issues/64).

## Histórico de versões

### [0.5.0] - 23/10/2026
#### Adicionado/Atualizado
- Animações do menu, do mascote e das telas de acesso (#108, 22/10).
- Textura, título e contraste das telas de acesso (#107, 20/10).
- Página inicial de apresentação, em `#inicio`, aberta para quem não tem sessão (#109).

### [0.4.0] - 13/10/2026
#### Adicionado/Atualizado
- Workflow de CI para os testes do backend e do frontend (HT031, #101).
- Layout base e visão geral do protótipo (HU033, #103).
- Reorganização do frontend em estoque, painel, equipe e acesso, sem mudar o visual (#104).

### [0.3.0] - 09/10/2026
#### Adicionado/Atualizado
- Modelagem do banco e migrações com Flyway (HT029 e HT030, #97).
- Ajustes no login e no menu lateral (#98), favicon e ícones do app (#99) e menu do celular (#100).

### [0.2.0] - 28/09/2026
#### Adicionado/Atualizado
- Backend migrado para Spring Boot 4 com organização em camadas (#30).
- Frontend organizado por features, ligado à API em login, cadastro e produtos (#45 e #55; revertidos em #56 e reintegrados em #58 em 02/10/2026).

### [0.1.0] - 13/09/2026
#### Adicionado/Atualizado
- Projeto Spring Boot com conexão ao PostgreSQL e CRUD de empresas.
- Login, usuários, produtos e tratamento de erros, entre 16/09 e 25/09/2026 (#10, #24 a #29).
