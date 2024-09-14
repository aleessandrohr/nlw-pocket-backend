import { createGoal } from "@/functions/create-goal";
import { createGoalSchema } from "@/schemas/create-goal";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const createGoalRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/goal",
		{
			schema: {
				body: createGoalSchema,
			},
		},
		async request => {
			const { title, desiredWeeklyFrequency } = request.body;

			await createGoal({
				title,
				desiredWeeklyFrequency,
			});
		}
	);
};
