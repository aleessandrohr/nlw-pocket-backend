# in.orbit — Backend

API do in.orbit, aplicação web para cadastro de metas semanais, conclusões e
resumo de produtividade.

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

## Documentação

- [Visão geral](./docs/overview.md)
- [Autenticação e API](./docs/auth-and-api.md)
- [Rotas](./docs/routes-and-api.md)
- [Banco de dados](./docs/database.md)
- [Configurações](./docs/configs.md)
- [Build e execução](./docs/build-and-run.md)
- [Datas e horários](./docs/date-and-time.md)
- [Estrutura de `src`](./docs/src-structure-and-conventions.md)
- [Plano da demo do portfólio](./docs/PLAN.md)
- [Changelog](./docs/changelog.md)
- [Instruções compartilhadas](../nlw-pocket-docs/instructions.md)

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

O projeto foi desenvolvido a partir da Next Level Week Pocket/in.orbit e
mantém licença MIT. O layout de referência está no
[Figma da Rocketseat](https://www.figma.com/community/file/1415093862269754302/nlw-pocket-js-in-orbit).
