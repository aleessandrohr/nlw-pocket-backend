# Datas e horários

O schema persiste `createdAt`, `updatedAt`, `refreshTokenExpiresAt` e
`goalCompletions.createdAt` como `timestamp with time zone`.

O backend usa `dayjs` para calcular início e fim da semana e para gerar dados
do seed. A lógica de resumo usa o relógio e os timestamps do PostgreSQL nas
consultas.

Ao adicionar um instante:

- persista-o com fuso no PostgreSQL;
- mantenha o contrato serializável pelo Fastify;
- faça a conversão para o fuso e a formatação visual somente no frontend;
- não trate um instante como uma data civil sem horário.
