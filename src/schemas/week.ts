import z from "zod";

const weekOffsetSchema = z.string().regex(/^-?\d+$/, "week must be an integer");

// Valida o deslocamento da semana recebido pela API antes da conversão numérica.
export const weekQuerySchema = z.object({
	week: weekOffsetSchema.optional(),
});
