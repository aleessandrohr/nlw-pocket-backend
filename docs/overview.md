# Visão geral

Este repositório contém a API do **in.orbit**. O backend autentica usuários e
fornece operações para metas semanais, conclusões e resumo da semana.

## Fluxo da aplicação

1. `src/http/server.ts` cria o Fastify, registra plugins e monta as rotas.
2. Rotas validam o contrato HTTP e chamam funções de `src/functions`.
3. As funções consultam ou alteram o PostgreSQL por Drizzle.
4. Rotas privadas usam o JWT armazenado no cookie `accessToken`.
5. O frontend consome a API com cookies e token CSRF.

## Stack

- Fastify e `fastify-type-provider-zod`;
- PostgreSQL, `postgres` e Drizzle ORM;
- `@fastify/jwt`, `@fastify/cookie` e `@fastify/csrf-protection`;
- Swagger para gerar a documentação OpenAPI;
- tsup para o bundle de produção e Pino para logs.

## Mapa da documentação

- [Autenticação e API](./auth-and-api.md)
- [Rotas](./routes-and-api.md)
- [Banco de dados](./database.md)
- [Configurações](./configs.md)
- [Build e execução](./build-and-run.md)
- [Datas e horários](./date-and-time.md)
- [Estrutura de `src`](./src-structure-and-conventions.md)
- [Plano da demo do portfólio](./PLAN.md)
- [Changelog](./changelog.md)

## Limites atuais

Não existem organizações, Better Auth, Stripe, billing, formulários ou
respostas neste backend. A rota de conta demo para o portfólio permanece
apenas como planejamento em [PLAN.md](./PLAN.md); o schema e a rotina de
limpeza das contas demo já foram preparados.
