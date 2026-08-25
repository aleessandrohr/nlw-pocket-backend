import { createGoalSchema } from "@/schemas/goals/create-goal";
import z from "zod";

export const getPendingGoalsResponseSchema = z.array(
	createGoalSchema.extend({
		id: z.cuid2(),
		completionCount: z.number(),
		completedToday: z.boolean(),
	})
);
