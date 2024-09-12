import { createGoal } from "@/functions/create-goal";
import { createGoalSchema } from "@/schemas/create-goal";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

export const getGoalsRoute: FastifyPluginAsyncZod = async app => {
	app.post(
		"/goals",
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
