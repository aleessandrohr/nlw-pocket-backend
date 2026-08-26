# Configurações

As variáveis são validadas em [`src/schemas/env.ts`](../src/schemas/env.ts).
Use [`.env.example`](../.env.example) como referência e nunca versione `.env`.

| Variável | Uso |
| --- | --- |
| `PORT` | Porta HTTP, convertida para número. |
| `HOST` | Host de bind; padrão `0.0.0.0`. |
| `NODE_ENV` | Ambiente (`development`, `test` ou `production`). Em produção, exige segredos com ao menos 32 caracteres. |
| `TRUST_PROXY` | Deve ser `true` atrás do proxy do Heroku para IP real e rate limit corretos; mantenha `false` localmente. |
| `DATABASE_URL` | URL do PostgreSQL. |
| `FRONTEND_URL` | Origem autorizada pelo CORS. |
| `JWT_SECRET` | Assinatura dos access tokens. |
| `COOKIE_SECRET` | Assinatura do cookie CSRF. |

Em produção, gere valores aleatórios e independentes para `JWT_SECRET` e
`COOKIE_SECRET`; não reutilize o exemplo local. O deploy no Heroku deve
configurar `NODE_ENV=production` e `TRUST_PROXY=true`.

## Scripts

Os scripts principais estão no `package.json`:

- `dev`: inicia tsx com reload;
- `build`: gera `dist` com tsup;
- `start`: inicia o bundle Node;
- `build:bun` e `start:bun`: alternativa compilada com Bun;
- `docker:start` e `docker:stop`: controlam o PostgreSQL local;
- `db:generate`, `db:migrate` e `db:studio`: ferramentas do Drizzle;
- `cleanup:demo`: remove, em uma transação direta no PostgreSQL, contas demo
  expiradas e seus dados relacionados.

## Qualidade

O backend usa Biome 1.x com tabs, aspas duplas e ponto e vírgula. A validação
direcionada é `npx biome check`; ela não deve ser confundida com um script
`biome:check`, que não existe atualmente neste `package.json`.
