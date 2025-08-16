import { createGoalSchema } from "@/schemas/goals/create-goal";
import z from "zod";

export const createGoalResponseSchema = createGoalSchema.extend({
	id: z.cuid2(),
	createdAt: z.date(),
});
