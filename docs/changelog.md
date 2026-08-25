# Changelog

## Contexto vigente

- O backend documenta o estado real do in.orbit: autenticação própria, metas,
  conclusões e resumo semanal.
- A demo efêmera do portfólio está em implementação incremental conforme
  [PLAN.md](./PLAN.md).

## 2026-08-24

- **Escopo:** documentação do backend
- **Resumo:** substituída a documentação herdada do Orgesta por tópicos do in.orbit.
- **Impacto:** README, autenticação, rotas, banco, configuração, execução e validação agora apontam para o código atual.
- **Validação:** revisão dos caminhos e contratos; `git diff --check` concluído.

## 2026-08-25

- **Escopo:** banco, manutenção e autenticação de contas demo
- **Resumo:** adicionadas a conta demo temporária e a rota pública `POST /auth/demo`.
- **Impacto:** o backend agora cria uma sessão isolada com metas e conclusões iniciais e remove demos anteriores ao iniciar uma nova.
- **Impacto adicional:** o cleanup passou a ser executado pelo backend, sem `pg_cron`, SQL operacional ou serviço externo.
- **Impacto adicional:** respostas de autenticação e perfil agora informam `isDemo` e `demoExpiresAt`.
- **Impacto adicional:** o `dayjs` passou a usar uma configuração compartilhada com locale `pt-br`.
- **Impacto adicional:** access tokens e refresh tokens de demos expiradas agora são rejeitados antes da remoção física pelo cleanup.
- **Impacto adicional:** o comando manual `cleanup:demo` permanece disponível para manutenção administrativa.
- **Impacto adicional:** metas podem ser arquivadas e desarquivadas com suas conclusões em transação; listas ativas ignoram metas arquivadas e o resumo preserva o histórico com `isArchived`.
- **Impacto adicional:** resumo e metas pendentes agora aceitam `week=0` ou deslocamentos negativos para consultar o histórico de semanas completas, de domingo a sábado, sem permitir semanas futuras.
- **Impacto adicional:** metas passaram a ser retornadas independentemente da semana selecionada; somente suas conclusões são filtradas pelo período consultado.
- **Impacto adicional:** conclusões históricas agora são rejeitadas no backend; o endpoint exige a semana `0` para registrar uma conclusão com o timestamp atual.
- **Impacto adicional:** uma meta agora aceita no máximo uma conclusão por dia, com validação transacional para evitar duplicidade em requisições simultâneas.
- **Impacto adicional:** `/pending-goals` agora retorna `completedToday` para o frontend bloquear visualmente uma nova conclusão no mesmo dia.
- **Correção:** limites de data usados no cálculo de `completedToday` agora são enviados como ISO UTC ao driver PostgreSQL.
- **Validação:** migration gerada sem aplicação; Biome, TypeScript, build e `git diff --check` concluídos.
