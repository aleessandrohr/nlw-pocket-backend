# Build e execução

## Desenvolvimento

```sh
bun install
bun run docker:start
bun run db:generate
bun run db:migrate
bun run dev
```

O servidor local usa `.env` e inicia em `http://localhost:3000` por padrão.

## Build

```sh
bun run build
bun run start
```

`tsup` empacota `src` em `dist`. O processo de produção Node inicia
`dist/http/server.js`.

## Docker e deploy

O `docker-compose.yml` fornece PostgreSQL 13. O [`Procfile`](../Procfile) usa
um release para executar `npx drizzle-kit migrate` e um processo web para
iniciar o bundle. Migrations de produção continuam sendo uma operação de
ambiente; não as aplique durante o startup da aplicação.

## Verificação

```sh
npx biome check
bun run build
git diff --check
```
