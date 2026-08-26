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
- **Impacto:** o backend agora cria uma sessão isolada com metas e conclusões iniciais e remove somente demos expiradas ao iniciar uma nova.
- **Impacto adicional:** a demo agora inicia com metas antigas, uma meta criada na semana atual, conclusões da semana atual e histórico da semana anterior.
- **Impacto adicional:** a demo também inicia com metas arquivadas e conclusões arquivadas para exercitar o histórico e a aba de desarquivamento.
- **Correção:** regras de hoje, semanas e expiração agora usam `America/Fortaleza`, mantendo os instantes persistidos como UTC.
- **Impacto adicional:** o agrupamento do resumo semanal passou a respeitar o fuso civil do produto em vez do timezone da sessão PostgreSQL.
- **Impacto adicional:** o cleanup passou a ser executado pelo backend, sem `pg_cron`, SQL operacional ou serviço externo.
- **Correção:** o logout explícito de uma conta demo agora remove a sessão, a conta e os dados temporários relacionados.
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
- **Impacto adicional:** adicionada a remoção de conclusões da semana atual, mantendo conclusões históricas imutáveis.
- **Correção:** a remoção de conclusão agora é permitida somente no mesmo dia do registro, mantendo os demais dias como histórico.
- **Correção:** o CORS passou a autorizar o método `DELETE` usado para desmarcar conclusões.
- **Refatoração:** o intervalo do dia civil passou a ser centralizado na biblioteca de data e reutilizado pelas regras de conclusão e metas pendentes.
- **Correção:** o contrato do resumo agora declara o total sempre numérico e os logs semanais registram apenas métricas, sem títulos ou dados das metas.
- **Configuração:** o Biome agora ignora artefatos gerados de build e dist, mantendo a validação restrita ao código-fonte.
- **Validação:** migration gerada sem aplicação; Biome, TypeScript, build e `git diff --check` concluídos.

## 2026-08-25

- **Escopo:** regras de sessão, validação e manutenção
- **Resumo:** access tokens agora são vinculados à sessão persistida, e logout ou expiração revogam o acesso imediatamente.
- **Impacto:** cadastro cria usuário e sessão atomicamente; refresh e logout validam somente a sessão do token, sem varrer sessões de outros dispositivos.
- **Impacto adicional:** e-mail, nome e título de meta são normalizados; o seed global destrutivo foi removido e migrations adicionam constraints e índices de domínio.
- **Correção:** o progresso semanal deixa de contar metas criadas depois da semana ou arquivadas antes dela.
- **Validação:** Biome, build e `git diff --check` concluídos.

## 2026-08-25

- **Escopo:** segurança de autenticação e sessão
- **Resumo:** CSRF passou a proteger login, cadastro e demo; foram adicionados rate limits por IP e validação segura da configuração de produção.
- **Impacto:** segredos curtos impedem o startup produtivo e `TRUST_PROXY=true` deve ser configurado no Heroku para preservar o limite por IP real.
- **Impacto adicional:** removidos logs com dados de usuários e sessões; comparação de senha evita diferença observável entre e-mail inexistente e senha inválida.
- **Correção:** limpeza e criação da demo agora compartilham a mesma transação.
- **Dependências:** atualizados Fastify, JWT, Swagger e Drizzle ORM para versões sem os advisories diretos identificados.
- **Validação:** Biome, build e `git diff --check` concluídos.
