import z from "zod";

export const createGoalCompletionSchema = z.object({
	goalId: z.cuid2(),
	week: z.number().int().max(0),
});
