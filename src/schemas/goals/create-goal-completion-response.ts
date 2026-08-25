import z from "zod";

export const createGoalCompletionResponseSchema = z.object({
	id: z.cuid2(),
	goalId: z.cuid2(),
	createdAt: z.date(),
});
