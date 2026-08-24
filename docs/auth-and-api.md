# Autenticação e API

## Sessão

O plugin [`src/plugins/auth.ts`](../src/plugins/auth.ts) adiciona
`app.authenticate`. O hook usa `request.jwtVerify({ onlyCookie: true })`,
portanto rotas privadas aceitam o JWT do cookie `accessToken`.

O login e o cadastro criam uma sessão persistida em `sessions` e enviam:

- `accessToken`: JWT com validade de 15 minutos;
- `refreshToken`: token aleatório armazenado apenas por hash no banco, com
  validade de 7 dias.

As opções dos cookies estão em [`src/config/index.ts`](../src/config/index.ts).
Eles são `httpOnly`, `secure` em produção e usam `SameSite=Strict`.

## CSRF

`GET /auth/csrf-token` cria o cookie assinado `_csrf` e retorna o valor que o
frontend mantém em memória. Requests `POST`, `PUT`, `PATCH` e `DELETE` das
rotas protegidas exigem o header `X-CSRF-TOKEN` correspondente.

## CORS

`src/http/server.ts` aceita somente `env.FRONTEND_URL` e habilita
`credentials: true`. Não amplie a origem para `*` quando cookies estiverem
envolvidos.

## Erros

Erros conhecidos usam as classes em `src/functions/errors`. O handler global
converte erros de validação Zod e respostas de erro em um corpo com
`statusCode`, `error`, `message` e, fora de produção, `details` ou `stack`.

## Integrações atuais

Não há Better Auth, OAuth, e-mail, Stripe ou billing. O sistema atual é uma
autenticação própria baseada em JWT, refresh token, cookies e CSRF.
