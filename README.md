# in.orbit — Backend

API do in.orbit, aplicação web para cadastro de metas semanais, conclusões e
resumo de produtividade.

## Sobre o projeto

O in.orbit começou durante a **Next Level Week Pocket**, da Rocketseat. A API foi construída acompanhando o desafio do evento e serviu como uma
base prática para trabalhar com Fastify, PostgreSQL e Drizzle.

<p align="center">
  <img alt="in.orbit" src="./src/assets/logo.svg" width="180">
</p>

## Stack

- Node.js/Bun e TypeScript
- Fastify 5
- PostgreSQL e Drizzle ORM
- Zod para contratos HTTP
- JWT, cookies e proteção CSRF
- Biome, tsup e Docker Compose

## Responsabilidades atuais da API

- Cadastro e login com sessões persistidas, access token, refresh token e cookies
  `httpOnly`;
- Proteção CSRF, CORS restrito, rate limit por IP e validação dos contratos com
  Zod;
- Criação de contas demo temporárias, com dados iniciais, expiração, invalidação
  e limpeza controlada;
- Cadastro, arquivamento, restauração e consulta histórica de metas;
- Regra de uma conclusão por meta no mesmo dia e bloqueio de alterações
  históricas;
- Resumo semanal com navegação por semanas completas, de domingo a sábado;
- Regras de fuso horário do produto e persistência de instantes em UTC;
- Isolamento dos dados por usuário e autorização nas rotas privadas;
- Documentação OpenAPI disponível em `/docs`.

## Documentação

- [Visão geral](./docs/overview.md)
- [Autenticação e API](./docs/auth-and-api.md)
- [Rotas](./docs/routes-and-api.md)
- [Banco de dados](./docs/database.md)
- [Configurações](./docs/configs.md)
- [Build e execução](./docs/build-and-run.md)
- [Datas e horários](./docs/date-and-time.md)
- [Estrutura de `src`](./docs/src-structure-and-conventions.md)
- [Changelog](./docs/changelog.md)

## Execução local

Requisitos: Bun, Docker e PostgreSQL via Docker Compose.

```sh
bun install
bun run docker:start
bun run db:generate
bun run db:migrate
bun run dev
```

A API inicia por padrão em `http://localhost:3000`. O arquivo `.env.example`
contém as variáveis necessárias para o ambiente local.

Para uma execução semelhante à produção:

```sh
bun run build
bun run start
```

## Origem

O ponto de partida do projeto foi a Next Level Week Pocket/in.orbit. O layout
original pode ser encontrado no
[Figma da Rocketseat](https://www.figma.com/community/file/1415093862269754302/nlw-pocket-js-in-orbit).

Depois do evento, a API recebeu novas regras, integrações, refatorações e
melhorias de segurança. Esta versão continua sob licença MIT.
