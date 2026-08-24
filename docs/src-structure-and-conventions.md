# Estrutura de `src` e convenções

```text
src/
├── assets/       # logo e imagem de capa do projeto
├── config/       # cookies, constantes e expressões regulares
├── db/           # conexão, schema e seed
├── functions/    # regras de autenticação, metas, resumo e perfil
├── http/         # servidor e rotas públicas/privadas
├── plugins/      # plugins Fastify, como autenticação
├── schemas/      # validação Zod de ambiente, entrada e resposta
├── types/        # extensões de tipos do Fastify
└── utils/        # logger, senha e refresh token
```

## Responsabilidades

- `http/routes` traduz HTTP para funções e registra hooks de segurança;
- `functions` contém as operações de negócio e acesso ao banco;
- `schemas` define contratos de entrada e saída;
- `db/schema.ts` é a fonte de verdade das tabelas Drizzle;
- `config` centraliza opções de cookies e constantes;
- `utils` contém implementações reutilizáveis sem responsabilidade de rota.

Mantenha a validação fora das funções quando ela for específica do contrato
HTTP. Evite colocar consultas diretamente em handlers quando uma operação de
negócio já puder ser isolada em `functions`.
