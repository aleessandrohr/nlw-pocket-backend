# Datas e horários

O schema persiste `createdAt`, `updatedAt`, `refreshTokenExpiresAt` e
`goalCompletions.createdAt` como `timestamp with time zone`.

O backend usa [`src/lib/dayjs.ts`](../src/lib/dayjs.ts) como ponto único de
configuração do `dayjs`, incluindo o locale `pt-br`. Essa instância é usada
para gerar dados do seed e calcular as faixas semanais. As consultas de resumo
e metas recebem o deslocamento `week`: `0` representa a semana atual e valores
negativos representam semanas anteriores.

As semanas do produto são sempre de domingo a sábado. O deslocamento é
calculado a partir do domingo da semana atual, sem transformar o filtro em uma
data civil enviada pelo cliente. A lógica de resumo usa o relógio e os
timestamps do PostgreSQL nas consultas.

Ao adicionar um instante:

- persista-o com fuso no PostgreSQL;
- mantenha o contrato serializável pelo Fastify;
- faça a conversão para o fuso e a formatação visual somente no frontend;
- não trate um instante como uma data civil sem horário.
