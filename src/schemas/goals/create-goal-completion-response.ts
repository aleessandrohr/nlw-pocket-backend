import { createGoalCompletionSchema } from "@/schemas/goals/create-goal-completion";
import z from "zod";

export const createGoalCompletionResponseSchema =
	createGoalCompletionSchema.extend({
		id: z.cuid2(),
		createdAt: z.date(),
	});
