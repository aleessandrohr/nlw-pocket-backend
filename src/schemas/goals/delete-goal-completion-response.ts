import z from "zod";

export const deleteGoalCompletionResponseSchema = z.object({
	id: z.cuid2(),
});
