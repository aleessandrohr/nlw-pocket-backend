import z from "zod";

export const createGoalSchema = z.object({
	title: z.string().trim().min(1).max(255),
	desiredWeeklyFrequency: z.number().int().min(1).max(7),
});
