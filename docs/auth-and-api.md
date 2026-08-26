# Autenticação e API

## Sessão

O plugin [`src/plugins/auth.ts`](../src/plugins/auth.ts) adiciona
`app.authenticate`. O hook usa `request.jwtVerify({ onlyCookie: true })`,
portanto rotas privadas aceitam o JWT do cookie `accessToken`.

O login e o cadastro criam uma sessão persistida em `sessions` e enviam:

- `accessToken`: JWT com validade de 15 minutos;
- `refreshToken`: token aleatório armazenado apenas por hash no banco, com
  validade de 7 dias.

O JWT também carrega o identificador da sessão que o emitiu. Em cada rota
privada, a API confirma que essa sessão ainda pertence ao usuário e não
expirou; assim, o logout revoga o access token imediatamente, mesmo dentro dos
15 minutos de validade criptográfica.

`POST /auth/demo` usa o mesmo mecanismo de cookies, mas cria um usuário
isolado com `is_demo = true`, dados iniciais e expiração configurada no backend. O e-mail
e a senha são gerados internamente e não são expostos ao visitante. As
respostas de autenticação também retornam `isDemo` e `demoExpiresAt` para o
frontend identificar a sessão.

Rotas privadas revalidam `demoExpiresAt` no banco, então um access token ainda
não expirado não mantém uma demo ativa. O refresh token também é invalidado
quando o prazo termina. Ao iniciar uma nova demo, somente contas demo
expiradas e seus dados são removidos em uma transação; demos ativas permanecem
intactas. Não há dependência de `pg_cron` ou serviço externo.

As opções dos cookies estão em [`src/config/index.ts`](../src/config/index.ts).
Eles são `httpOnly`, `secure` em produção e usam `SameSite=Strict`.

## CSRF

`GET /auth/csrf-token` cria o cookie assinado `_csrf` e retorna o valor que o
frontend mantém em memória. Antes de login, cadastro ou demo, o cliente chama
esse endpoint e só então envia a mutation com o header `X-CSRF-TOKEN`.
Todas as mutations, inclusive as que iniciam sessão, exigem esse header.

Nome, e-mail e título de meta são normalizados no contrato HTTP. E-mails são
convertidos para minúsculas e textos obrigatórios são removidos de espaços nas
extremidades antes da validação.

## Limites de autenticação

Login, cadastro, demo e refresh usam rate limit por IP. Com `TRUST_PROXY=true`,
o Fastify considera corretamente o IP encaminhado pelo proxy de produção.
Não remova esses limites nem use uma origem CORS curinga com cookies.

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
