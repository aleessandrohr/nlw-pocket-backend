# Demo efêmera do in.orbit no portfólio

> Status: rota de criação da demo implementada no backend; a integração do
> frontend e do portfólio ainda não.

## Resumo

Criar uma rota `/demo` no frontend do in.orbit. O botão do portfólio passará a abrir essa rota, que criará automaticamente uma conta temporária, fará login e redirecionará o visitante para o resumo.

O acesso normal ao site continuará levando à tela de login.

## Etapa concluída

- O schema de `users` possui `is_demo` e `demo_expires_at`.
- A relação entre conclusões e metas declara `ON DELETE CASCADE`.
- O comando `bun run cleanup:demo` executa a limpeza diretamente no PostgreSQL,
  em uma transação e sem depender de scheduler ou serviço externo.
- A rota `POST /auth/demo` cria uma conta isolada, dados iniciais e sessão com
  expiração configurada no backend.
- A criação de uma nova demo remove todas as contas demo anteriores em uma
  transação antes de inserir os novos dados.
- O middleware e o refresh token invalidam demos expiradas sem depender da
  remoção física imediata.
- A migration foi gerada, mas ainda não foi aplicada ao banco.

## Alterações principais

### Backend

- Aplicar rate limit específico no endpoint demo.
- Reutilizar os campos `is_demo` e `demo_expires_at` já adicionados ao usuário.
- Reutilizar os cookies atuais de access token, refresh token e CSRF.
- Alterar o logout para excluir usuários demo, sessões, metas e conclusões relacionadas.
- Reutilizar a rotina de exclusão de dados demo na abertura de uma nova demo.
- Manter o comando manual `bun run cleanup:demo` para manutenção administrativa.

### Frontend do in.orbit

- Criar `DemoRoute` em `/demo`.
- Ao acessar:
  1. Solicitar uma sessão demo.
  2. Obter o token CSRF.
  3. Armazenar a sessão em memória.
  4. Redirecionar para `/summary`.
- Impedir que o `AuthProvider` redirecione `/demo` para o login antes da criação da sessão.
- Adicionar estado `isDemo` ao contexto de autenticação.
- Escutar uma mensagem segura do portfólio para encerrar a demonstração quando o modal for fechado.
- Aceitar mensagens somente da origem exata do portfólio.

### Portfólio

- Manter o link “Acessar projeto” apontando para o site normal.
- Alterar somente o `iframeUrl` do in.orbit para:

```text
https://inorbit.aleessandrohr.dev.br/demo
```

- Tornar o diálogo controlado.
- Enviar uma mensagem `demo:close` ao iframe antes de desmontá-lo.
- Usar `targetOrigin` específico, sem `*`.
- Manter o TTL no backend como fallback para abas fechadas, travamentos ou perda de conexão.

Não será necessário criar um proxy no Next.js nem ampliar o CORS para o domínio do portfólio: as chamadas continuam sendo feitas pelo frontend do in.orbit, que já é a origem autorizada pela API.

## Fluxo esperado

```text
Portfólio
   ↓ abre iframe /demo
in.orbit /demo
   ↓ POST /auth/demo
API cria usuário temporário + sessão
   ↓
Frontend obtém CSRF e abre /summary
   ↓
Visitante testa metas e conclusões
   ↓
Logout ou fechamento do modal
   ↓
Conta demo e dados são removidos
```

## Testes e critérios de aceite

- Clicar em “Demonstração” abre diretamente o resumo, sem tela de login.
- Cada navegador recebe dados isolados.
- O visitante consegue criar metas e marcar conclusões.
- O logout exclui a conta demo e seus dados.
- Fechar o modal envia o sinal de encerramento.
- Fechar a aba sem logout deixa a conta disponível apenas até o TTL.
- Usuários normais continuam funcionando sem exclusão no logout.
- A URL normal do projeto continua exibindo o login.
- Validar migração, build, lint e teste de produção em janela anônima.
- Confirmar que cookies, CORS e iframe continuam funcionando no domínio publicado.

## Assumptions

- A conta demo terá validade padrão de 1 hora.
- O logout explícito fará a exclusão imediata.
- O fechamento do iframe será uma tentativa de limpeza; o TTL será a garantia contra contas abandonadas.
- O recurso será implementado nos três repositórios, mantendo portfólio, frontend e backend separados.
