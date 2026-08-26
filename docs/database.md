# Banco de dados

O backend usa PostgreSQL com Drizzle ORM. A conexão e o schema agregado ficam
em [`src/db/index.ts`](../src/db/index.ts) e [`src/db/schema.ts`](../src/db/schema.ts).

## Tabelas atuais

- `users`: nome, e-mail, senha com hash, marcação de demo, expiração e
  timestamps;
- `sessions`: sessões, hash do refresh token, expiração, user-agent e IP;
- `goals`: metas vinculadas a um usuário, frequência semanal desejada e estado
  de arquivamento;
- `goal_completions`: conclusões vinculadas a uma meta, também com estado de
  arquivamento sincronizado.

O arquivamento usa `goals.is_archived` como fonte principal e registra o
instante em `goals.archived_at`. As conclusões relacionadas recebem a mesma
flag dentro da transação; ao desarquivar, as duas partes são reativadas. As
metas arquivadas não aparecem em `pending-goals`, mas ficam disponíveis em
`GET /archived-goals`. O resumo semanal preserva o histórico completo e marca
cada conclusão com `isArchived` para a interface diferenciar registros
arquivados. O total do resumo considera a meta somente enquanto ela existia
na semana consultada: uma meta arquivada ainda participa da semana em que foi
arquivada, mas não altera o progresso das semanas seguintes.

`sessions.user_id`, `goals.user_id` e `goal_completions.goal_id` agora usam
`ON DELETE CASCADE` no schema. A migration inicial ainda possui a FK de
conclusões com `ON DELETE NO ACTION`; a migration seguinte corrige essa
diferença e deve ser aplicada pelo responsável pelo ambiente.

O banco também impõe a frequência entre 1 e 7, títulos de metas não vazios,
expiração obrigatória para demos e unicidade case-insensitive de e-mail. Índices
compostos atendem às consultas recorrentes de metas e conclusões.

`cleanup:demo` remove somente contas demo expiradas, suas conclusões e metas
nessa ordem, dentro de uma transação SQL. A criação de uma nova demo executa a mesma
limpeza antes de inserir a conta, evitando acumular dados demo abandonados.
Sessões são removidas pela cascata de `sessions.user_id`.
Todo access token referencia a sessão que o emitiu; rotas privadas rejeitam o
token se a sessão tiver sido removida no logout ou expirado.

A expiração não depende da remoção física: o middleware rejeita demos cujo
`demo_expires_at` terminou e o refresh token também é invalidado. O comando
`bun run cleanup:demo` permanece disponível para limpeza manual.

## Migrations

As migrations ficam em [`.migrations/`](../.migrations/). Altere primeiro
`src/db/schema.ts`, gere com `bun run db:generate`, revise o SQL e aplique com
`bun run db:migrate` somente no ambiente responsável pelo banco.

A migration `0003_redundant_sumo` adiciona as constraints e índices de
integridade atuais. Revise especialmente duplicidades de e-mail que diferem
apenas por maiúsculas antes de aplicá-la em uma base já existente.

O seed legado foi removido para impedir uma exclusão global acidental de metas
e conclusões. Dados de desenvolvimento devem ser criados por uma rotina
dedicada e isolada quando ela for necessária.
