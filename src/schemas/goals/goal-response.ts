import { createGoalSchema } from "@/schemas/goals/create-goal";
import z from "zod";

export const goalResponseSchema = createGoalSchema.extend({
	id: z.cuid2(),
	isArchived: z.boolean(),
	archivedAt: z.date().nullable(),
	createdAt: z.date(),
});
