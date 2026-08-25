# Banco de dados

O backend usa PostgreSQL com Drizzle ORM. A conexão e o schema agregado ficam
em [`src/db/index.ts`](../src/db/index.ts) e [`src/db/schema.ts`](../src/db/schema.ts).

## Tabelas atuais

- `users`: nome, e-mail, senha com hash, marcação de demo, expiração e
  timestamps;
- `sessions`: sessões, hash do refresh token, expiração, user-agent e IP;
- `goals`: metas vinculadas a um usuário e frequência semanal desejada;
- `goal_completions`: conclusões vinculadas a uma meta.

`sessions.user_id`, `goals.user_id` e `goal_completions.goal_id` agora usam
`ON DELETE CASCADE` no schema. A migration inicial ainda possui a FK de
conclusões com `ON DELETE NO ACTION`; a migration seguinte corrige essa
diferença e deve ser aplicada pelo responsável pelo ambiente.

`cleanup:demo` remove todas as contas demo, suas conclusões e metas nessa
ordem, dentro de uma transação SQL. A criação de uma nova demo executa a mesma
limpeza antes de inserir a conta, evitando acumular dados demo abandonados.
Sessões são removidas pela cascata de `sessions.user_id`.

A expiração não depende da remoção física: o middleware rejeita demos cujo
`demo_expires_at` terminou e o refresh token também é invalidado. O comando
`bun run cleanup:demo` permanece disponível para limpeza manual.

## Migrations

As migrations ficam em [`.migrations/`](../.migrations/). Altere primeiro
`src/db/schema.ts`, gere com `bun run db:generate`, revise o SQL e aplique com
`bun run db:migrate` somente no ambiente responsável pelo banco.

## Seed

[`src/db/seed.ts`](../src/db/seed.ts) é um seed legado que limpa metas e
conclusões e usa um `userId` fixo vazio. Não o trate como preparação segura para
um banco com usuários reais; revise-o antes de reutilizar.
