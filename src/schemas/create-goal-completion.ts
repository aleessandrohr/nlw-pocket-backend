import z from "zod";

export const createGoalCompletionSchema = z.object({
	goalId: z.string(),
});
