# Rotas e API

As rotas são registradas em [`src/http/server.ts`](../src/http/server.ts).
Não existe prefixo `/api` no contrato atual.

## Autenticação pública

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/auth/create-user` | Cria usuário e inicia sessão. |
| `POST` | `/auth/login` | Autentica por e-mail e senha. |
| `POST` | `/auth/demo` | Cria uma conta temporária e inicia a demonstração. |
| `GET` | `/auth/csrf-token` | Cria e retorna o token CSRF. |
| `POST` | `/auth/refresh-token` | Renova access e refresh tokens. |

## Autenticação privada

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/auth/logout` | Remove a sessão atual e limpa cookies. |
| `GET` | `/user/profile` | Retorna o perfil autenticado. |

## Metas e resumo

| Método | Rota | Função |
| --- | --- | --- |
| `POST` | `/goal` | Cadastra uma meta. |
| `POST` | `/goal/:goalId/archive` | Arquiva uma meta e suas conclusões. |
| `POST` | `/goal/:goalId/unarchive` | Desarquiva uma meta e suas conclusões. |
| `GET` | `/pending-goals` | Lista metas pendentes na semana. |
| `GET` | `/archived-goals` | Lista metas arquivadas do usuário. |
| `POST` | `/completion` | Registra a conclusão de uma meta. |
| `GET` | `/summary` | Retorna o resumo semanal. |

As rotas de alteração usam `app.authenticate` e `app.csrfProtection`. Os
schemas de entrada e resposta ficam em `src/schemas` e são usados pelo
Fastify para validação e documentação.

## Documentação OpenAPI

O Swagger é registrado no servidor. A interface fica em `/docs`; o JSON
gerado pelo plugin pode ser consumido pela configuração OpenAPI do Fastify.
