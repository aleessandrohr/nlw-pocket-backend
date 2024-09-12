import z from "zod";

export const createGoalSchema = z.object({
	title: z.string(),
	desiredWeeklyFrequency: z.number().int().min(1).max(7),
});
