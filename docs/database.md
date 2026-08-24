# Banco de dados

O backend usa PostgreSQL com Drizzle ORM. A conexão e o schema agregado ficam
em [`src/db/index.ts`](../src/db/index.ts) e [`src/db/schema.ts`](../src/db/schema.ts).

## Tabelas atuais

- `users`: nome, e-mail, senha com hash e timestamps;
- `sessions`: sessões, hash do refresh token, expiração, user-agent e IP;
- `goals`: metas vinculadas a um usuário e frequência semanal desejada;
- `goal_completions`: conclusões vinculadas a uma meta.

`sessions.user_id` e `goals.user_id` usam `ON DELETE CASCADE`. A FK de
`goal_completions.goal_id` na migration inicial usa `ON DELETE NO ACTION`,
portanto exclusões de metas precisam respeitar essa ordem até que o schema
seja alterado e uma nova migration seja gerada.

## Migrations

As migrations ficam em [`.migrations/`](../.migrations/). Altere primeiro
`src/db/schema.ts`, gere com `bun run db:generate`, revise o SQL e aplique com
`bun run db:migrate` somente no ambiente responsável pelo banco.

## Seed

[`src/db/seed.ts`](../src/db/seed.ts) é um seed legado que limpa metas e
conclusões e usa um `userId` fixo vazio. Não o trate como preparação segura para
um banco com usuários reais; revise-o antes de reutilizar.
