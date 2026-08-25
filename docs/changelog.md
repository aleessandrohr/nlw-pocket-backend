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
- **Validação:** migration gerada sem aplicação; Biome, TypeScript, build e `git diff --check` concluídos.
